import { CanonRecord } from '@/features/canon/domain';

export type AgentAttestedCanonRecord = CanonRecord & {
  agent: {
    address: string;
    signed_at: string;
    signature: string;
    schema_version: string;
  };
};

export interface AgentSigner {
  signCanon(
    encryptedPrivateKey: string,
    agentAddress: string,
    canonRecord: CanonRecord,
  ): Promise<AgentAttestedCanonRecord>;
}
