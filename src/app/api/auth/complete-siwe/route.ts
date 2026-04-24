import { SessionAuthService } from '@/features/auth/session-auth-service';
import { createSessionCookie } from '@/lib/session';
import { jsonOk, handleRouteError } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await new SessionAuthService().completeWalletAuth(body);
    await createSessionCookie(session);
    return jsonOk({ session });
  } catch (error) {
    return handleRouteError(error);
  }
}
