import { AgentRegistryService } from '@/features/agents/agent-registry-service';
import { HttpError, jsonOk, handleRouteError } from '@/lib/http';
import { getOptionalSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getOptionalSession();
    if (!session?.worldSessionId) {
      throw new HttpError(403, 'Bind World ID before rotating a Canon-Agent');
    }

    const agent = await new AgentRegistryService().rotateManagedAgent(session.worldSessionId);
    return jsonOk({
      agent: {
        walletAddress: agent.walletAddress,
        registrationStatus: agent.registrationStatus,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
