import { CanonService } from '@/features/canon/canon-service';
import { jsonOk, handleRouteError } from '@/lib/http';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ identifier: string }> },
) {
  try {
    const { identifier } = await params;
    const evolutions = await new CanonService().listEvolutionsBySlug(identifier);
    return jsonOk(evolutions);
  } catch (error) {
    return handleRouteError(error);
  }
}
