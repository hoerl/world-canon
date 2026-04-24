import { AgentRegistryService } from '@/features/agents/agent-registry-service';
import { MyCanonPage } from '@/features/canon/components/my-canon-page';
import { CanonService } from '@/features/canon/canon-service';
import { getOptionalSession } from '@/lib/session';

export default async function MePage() {
  const session = await getOptionalSession();
  const canonService = new CanonService();
  const agentService = new AgentRegistryService();

  const canon = session?.worldSessionId
    ? await canonService.getCanonByWorldSessionId(session.worldSessionId)
    : null;
  const agent = session?.worldSessionId
    ? await agentService.getAgentStatusByWorldSessionId(session.worldSessionId)
    : null;

  return (
    <MyCanonPage
      session={
        session
          ? {
              username: session.username,
              worldSessionId: session.worldSessionId,
            }
          : null
      }
      canon={canon}
      agent={
        agent
          ? {
              walletAddress: agent.walletAddress,
              registrationStatus: agent.registrationStatus,
              lastAttestedAt: agent.lastAttestedAt?.toISOString() ?? null,
            }
          : null
      }
    />
  );
}
