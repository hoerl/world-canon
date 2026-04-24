import { AgentAttestedCanonRecord, AgentSigner } from '@/features/agents/agent-signer';
import { CanonRecord } from '@/features/canon/domain';
import { canonicalJsonStringify, decryptSecret } from '@/lib/crypto';
import { getRequiredEnv } from '@/lib/env';
import { privateKeyToAccount } from 'viem/accounts';
import { Hex } from 'viem';

const SCHEMA_VERSION = 'canon-agent-v1';

export class ManagedAgentSigner implements AgentSigner {
  async signCanon(
    encryptedPrivateKey: string,
    agentAddress: string,
    canonRecord: CanonRecord,
  ): Promise<AgentAttestedCanonRecord> {
    const signedAt = new Date().toISOString();
    const privateKey = decryptSecret(
      encryptedPrivateKey,
      getRequiredEnv('AGENT_ENCRYPTION_SECRET'),
    ) as Hex;

    const account = privateKeyToAccount(privateKey);
    const payload = {
      slug: canonRecord.slug,
      username: canonRecord.username,
      updated_at: canonRecord.updated_at,
      canon: canonRecord.canon,
      evolutions_count: canonRecord.evolutions_count,
      schema_version: SCHEMA_VERSION,
    };

    const signature = await account.signMessage({
      message: canonicalJsonStringify(payload),
    });

    return {
      ...canonRecord,
      agent: {
        address: agentAddress,
        signed_at: signedAt,
        signature,
        schema_version: SCHEMA_VERSION,
      },
    };
  }
}
