import { AgentRegistryService } from '@/features/agents/agent-registry-service';
import { HttpError, jsonOk, handleRouteError } from '@/lib/http';
import { getOptionalSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getOptionalSession();
    if (!session?.worldSessionId) {
      throw new HttpError(403, 'Bind World ID before provisioning a Canon-Agent');
    }

    const result = await new AgentRegistryService().registerManagedAgent(session.worldSessionId);
    return jsonOk({
      agent: {
        walletAddress: result.agent.walletAddress,
        registrationStatus: result.agent.registrationStatus,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
