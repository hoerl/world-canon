import { ManagedAgentSigner } from '@/features/agents/managed-agent-signer';
import { CanonRecord } from '@/features/canon/domain';
import { canonicalJsonStringify, encryptSecret } from '@/lib/crypto';
import { privateKeyToAccount } from 'viem/accounts';
import { recoverMessageAddress } from 'viem';
import { describe, expect, it } from 'vitest';

describe('ManagedAgentSigner', () => {
  it('signs canon payloads with the managed agent wallet', async () => {
    process.env.AGENT_ENCRYPTION_SECRET = 'test-agent-encryption-secret';

    const privateKey =
      '0x1111111111111111111111111111111111111111111111111111111111111111' as const;
    const account = privateKeyToAccount(privateKey);
    const signer = new ManagedAgentSigner();

    const canon: CanonRecord = {
      slug: 'lea',
      username: 'lea',
      updated_at: new Date('2026-04-24T00:00:00.000Z').toISOString(),
      canon: {
        person: { title: 'Agnes Martin', rationale: 'the horizon line is a kindness.' },
        place: { title: 'Parc des Buttes-Chaumont', rationale: 'the city is still asleep.' },
        thing: { title: 'Andrei Rublev', rationale: 'the horses.' },
      },
      evolutions_count: 3,
    };

    const signed = await signer.signCanon(
      encryptSecret(privateKey, process.env.AGENT_ENCRYPTION_SECRET),
      account.address,
      canon,
    );

    const recoveredAddress = await recoverMessageAddress({
      message: canonicalJsonStringify({
        canon: signed.canon,
        evolutions_count: signed.evolutions_count,
        schema_version: signed.agent.schema_version,
        slug: signed.slug,
        updated_at: signed.updated_at,
        username: signed.username,
      }),
      signature: signed.agent.signature,
    });

    expect(recoveredAddress).toBe(account.address);
  });
});
