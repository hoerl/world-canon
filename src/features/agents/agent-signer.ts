import { CanonRecord, CanonRecordV2 } from '@/features/canon/domain';

export type AgentAttestedCanonRecord = CanonRecord & {
  agent: {
    address: string;
    signed_at: string;
    signature: string;
    schema_version: string;
  };
};

export type AgentAttestedCanonRecordV2 = CanonRecordV2 & {
  agent: {
    address: string;
    registered: boolean;
    registered_at: string | null;
  };
  signature: string;
  signed_at: string;
};

export interface AgentSigner {
  signCanon(
    encryptedPrivateKey: string,
    agentAddress: string,
    canonRecord: CanonRecord,
  ): Promise<AgentAttestedCanonRecord>;

  signCanonV2(
    encryptedPrivateKey: string,
    agentAddress: string,
    registered: boolean,
    registeredAt: Date | null,
    canonRecord: CanonRecordV2,
  ): Promise<AgentAttestedCanonRecordV2>;
}
