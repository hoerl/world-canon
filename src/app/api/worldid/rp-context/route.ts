import { HumanBindingService } from '@/features/worldid/human-binding-service';
import { HttpError, jsonOk, handleRouteError } from '@/lib/http';
import { getOptionalSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getOptionalSession();
    console.log('[worldid/rp-context] POST', {
      hasSession: Boolean(session),
      wallet: session?.walletAddress?.slice(0, 10),
    });
    if (!session) {
      throw new HttpError(401, 'Sign in before requesting World ID binding');
    }

    return jsonOk(new HumanBindingService().createRpContext());
  } catch (error) {
    return handleRouteError(error);
  }
}
