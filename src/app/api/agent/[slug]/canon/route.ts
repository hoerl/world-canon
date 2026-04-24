import { AgentRegistryService } from '@/features/agents/agent-registry-service';
import { jsonOk, handleRouteError } from '@/lib/http';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const signedCanon = await new AgentRegistryService().getSignedCanonBySlug(slug);
    return jsonOk(signedCanon);
  } catch (error) {
    return handleRouteError(error);
  }
}
