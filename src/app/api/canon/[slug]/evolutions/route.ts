import { CanonService } from '@/features/canon/canon-service';
import { jsonOk, handleRouteError } from '@/lib/http';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const evolutions = await new CanonService().listEvolutionsBySlug(slug);
    return jsonOk(evolutions);
  } catch (error) {
    return handleRouteError(error);
  }
}
