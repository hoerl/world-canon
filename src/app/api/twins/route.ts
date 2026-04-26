import { CanonService } from '@/features/canon/canon-service';
import { TwinMatchingService } from '@/features/twins/twin-matching-service';
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

    const canonService = new CanonService();
    const user = await canonService.getUserByWorldSessionId(session.worldSessionId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    const twins = await new TwinMatchingService().findTwins(user.id);
    return jsonOk({ twins });
  } catch (error) {
    return handleRouteError(error);
  }
}
