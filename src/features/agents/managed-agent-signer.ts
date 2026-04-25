import {
  AgentAttestedCanonRecord,
  AgentAttestedCanonRecordV2,
  AgentSigner,
} from '@/features/agents/agent-signer';
import { CanonRecord, CanonRecordV2 } from '@/features/canon/domain';
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

  async signCanonV2(
    encryptedPrivateKey: string,
    agentAddress: string,
    registered: boolean,
    registeredAt: Date | null,
    canonRecord: CanonRecordV2,
  ): Promise<AgentAttestedCanonRecordV2> {
    const signedAt = new Date().toISOString();
    const privateKey = decryptSecret(
      encryptedPrivateKey,
      getRequiredEnv('AGENT_ENCRYPTION_SECRET'),
    ) as Hex;

    const account = privateKeyToAccount(privateKey);
    const signature = await account.signMessage({
      message: canonicalJsonStringify(canonRecord),
    });

    return {
      ...canonRecord,
      agent: {
        address: agentAddress,
        registered,
        registered_at: registeredAt?.toISOString() ?? null,
      },
      signature,
      signed_at: signedAt,
    };
  }
}
