import { HumanBindingService } from '@/features/worldid/human-binding-service';
import { HttpError, jsonOk, handleRouteError } from '@/lib/http';
import { getOptionalSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getOptionalSession();
    if (!session) {
      throw new HttpError(401, 'Sign in before requesting World ID binding');
    }

    return jsonOk(new HumanBindingService().createRpContext());
  } catch (error) {
    return handleRouteError(error);
  }
}
