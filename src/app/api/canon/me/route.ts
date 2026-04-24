import { CanonService } from '@/features/canon/canon-service';
import { HttpError, jsonOk, handleRouteError } from '@/lib/http';
import { getOptionalSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getOptionalSession();
    if (!session) {
      throw new HttpError(401, 'Unauthorized');
    }

    if (!session.worldSessionId) {
      throw new HttpError(403, 'World ID binding required');
    }

    const canon = await new CanonService().getCanonByWorldSessionId(session.worldSessionId);
    return jsonOk(canon);
  } catch (error) {
    return handleRouteError(error);
  }
}
