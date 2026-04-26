import { HumanBindingService } from '@/features/worldid/human-binding-service';
import { HttpError, jsonOk, handleRouteError } from '@/lib/http';
import { createSessionCookie, getOptionalSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getOptionalSession();
    console.log('[worldid/verify] POST', {
      hasSession: Boolean(session),
      wallet: session?.walletAddress?.slice(0, 10),
    });
    if (!session) {
      throw new HttpError(401, 'Sign in before binding World ID');
    }

    const proof = await request.json();
    const user = await new HumanBindingService().verifyAndBindSessionProof(proof, session);

    await createSessionCookie({
      ...session,
      username: user.worldUsername,
      worldSessionId: user.worldSessionId as `session_${string}`,
    });

    console.log('[worldid/verify] Success', {
      slug: user.publicSlug,
      sessionId: user.worldSessionId,
    });

    return jsonOk({
      user: {
        slug: user.publicSlug,
        username: user.worldUsername,
        world_session_id: user.worldSessionId,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
