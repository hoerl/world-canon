import { AgentAttestedCanonRecord } from '@/features/agents/agent-signer';
import { ManagedAgentSigner } from '@/features/agents/managed-agent-signer';
import { CanonService } from '@/features/canon/canon-service';
import { encryptSecret } from '@/lib/crypto';
import { getAgentBookRpcUrl, getRequiredEnv, hasDatabase } from '@/lib/env';
import { HttpError } from '@/lib/http';
import { agentIdentities, users } from '@/lib/db/schema';
import { getDb } from '@/lib/db/client';
import { createAgentBookVerifier } from '@worldcoin/agentkit';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { privateKeyToAccount } from 'viem/accounts';
import { Hex } from 'viem';

export class AgentRegistryService {
  constructor(
    private readonly canonService = new CanonService(),
    private readonly signer = new ManagedAgentSigner(),
  ) {}

  async getActiveAgentByUserId(userId: string) {
    if (!hasDatabase()) {
      throw new HttpError(503, 'DATABASE_URL is not configured');
    }

    const [agent] = await getDb()
      .select()
      .from(agentIdentities)
      .where(and(eq(agentIdentities.userId, userId), isNull(agentIdentities.revokedAt)))
      .orderBy(desc(agentIdentities.createdAt))
      .limit(1);

    return agent ?? null;
  }

  async registerManagedAgent(worldSessionId: string) {
    const canon = await this.canonService.requireCompleteCanonForWorldSessionId(worldSessionId);
    const user = await this.canonService.getUserByWorldSessionId(worldSessionId);
    if (!user) {
      throw new HttpError(404, 'Bound user not found');
    }

    let activeAgent = await this.getActiveAgentByUserId(user.id);
    if (!activeAgent) {
      const privateKey = (`0x${randomBytes(32).toString('hex')}`) as Hex;
      const account = privateKeyToAccount(privateKey);

      const [createdAgent] = await getDb()
        .insert(agentIdentities)
        .values({
          userId: user.id,
          walletAddress: account.address,
          encryptedPrivateKey: encryptSecret(
            privateKey,
            getRequiredEnv('AGENT_ENCRYPTION_SECRET'),
          ),
          registrationStatus: 'pending',
        })
        .returning();

      activeAgent = createdAgent;
    }

    const refreshed = await this.refreshRegistrationStatus(activeAgent.id);

    return {
      canon,
      agent: refreshed,
    };
  }

  async rotateManagedAgent(worldSessionId: string) {
    const user = await this.canonService.getUserByWorldSessionId(worldSessionId);
    if (!user) {
      throw new HttpError(404, 'Bound user not found');
    }

    const existing = await this.getActiveAgentByUserId(user.id);
    if (!existing) {
      throw new HttpError(404, 'No active Crate-Agent to rotate');
    }

    const now = new Date();
    await getDb()
      .update(agentIdentities)
      .set({
        registrationStatus: 'rotated',
        revokedAt: now,
        updatedAt: now,
      })
      .where(eq(agentIdentities.id, existing.id));

    const privateKey = (`0x${randomBytes(32).toString('hex')}`) as Hex;
    const account = privateKeyToAccount(privateKey);

    const [rotatedAgent] = await getDb()
      .insert(agentIdentities)
      .values({
        userId: user.id,
        walletAddress: account.address,
        encryptedPrivateKey: encryptSecret(
          privateKey,
          getRequiredEnv('AGENT_ENCRYPTION_SECRET'),
        ),
        registrationStatus: 'pending',
        rotatedFromAgentId: existing.id,
      })
      .returning();

    return this.refreshRegistrationStatus(rotatedAgent.id);
  }

  async getSignedCanonBySlug(slug: string): Promise<AgentAttestedCanonRecord> {
    const canon = await this.canonService.getCanonBySlug(slug);
    if (!canon) {
      throw new HttpError(404, 'Crate not found');
    }

    const [user] = await getDb().select().from(users).where(eq(users.publicSlug, slug)).limit(1);
    if (!user) {
      throw new HttpError(404, 'Crate owner not found');
    }

    const agent = await this.getActiveAgentByUserId(user.id);
    if (!agent) {
      throw new HttpError(404, 'Crate-Agent not found');
    }

    const signedCanon = await this.signer.signCanon(
      agent.encryptedPrivateKey,
      agent.walletAddress,
      canon,
    );

    await getDb()
      .update(agentIdentities)
      .set({
        lastAttestedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentIdentities.id, agent.id));

    return signedCanon;
  }

  async getAgentStatusByWorldSessionId(worldSessionId: string) {
    const user = await this.canonService.getUserByWorldSessionId(worldSessionId);
    if (!user) {
      return null;
    }

    const agent = await this.getActiveAgentByUserId(user.id);
    if (!agent) {
      return null;
    }

    return this.refreshRegistrationStatus(agent.id);
  }

  private async refreshRegistrationStatus(agentId: string) {
    const [agent] = await getDb()
      .select()
      .from(agentIdentities)
      .where(eq(agentIdentities.id, agentId))
      .limit(1);

    if (!agent) {
      throw new HttpError(404, 'Agent not found');
    }

    try {
      const verifier = createAgentBookVerifier({
        rpcUrl: getAgentBookRpcUrl(),
      });
      const humanId = await verifier.lookupHuman(agent.walletAddress);

      if (humanId && agent.registrationStatus !== 'registered') {
        const [updated] = await getDb()
          .update(agentIdentities)
          .set({
            registrationStatus: 'registered',
            registeredAt: agent.registeredAt ?? new Date(),
            updatedAt: new Date(),
          })
          .where(eq(agentIdentities.id, agent.id))
          .returning();
        return updated;
      }
    } catch {
      return agent;
    }

    return agent;
  }
}
