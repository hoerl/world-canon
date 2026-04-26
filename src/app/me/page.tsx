import { AgentRegistryService } from '@/features/agents/agent-registry-service';
import { MyCanonPage } from '@/features/canon/components/my-canon-page';
import { CanonService } from '@/features/canon/canon-service';
import { getOptionalSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function MePage() {
  const session = await getOptionalSession();
  const canonService = new CanonService();
  const agentService = new AgentRegistryService();

  const canon = session?.worldSessionId
    ? await canonService.getCanonByWorldSessionId(session.worldSessionId)
    : null;

  if (session?.worldSessionId && !canon) {
    redirect('/api/auth/sign-out');
  }

  const evolutions = canon
    ? await canonService.listEvolutionsBySlug(canon.slug)
    : [];
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
      evolutions={evolutions}
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
