import { CanonService } from '@/features/canon/canon-service';
import { slugifyCrateUserName } from '@/features/canon/domain';
import { isDemoSeedEnabled } from '@/lib/env';
import { HttpError, jsonOk, handleRouteError } from '@/lib/http';
import { createSessionCookie, getOptionalSession } from '@/lib/session';

export async function POST() {
  try {
    if (!isDemoSeedEnabled()) {
      throw new HttpError(404, 'Not found');
    }

    const session = await getOptionalSession();
    if (!session) {
      throw new HttpError(401, 'Sign in with wallet first');
    }

    if (session.worldSessionId) {
      return jsonOk({ already_bound: true });
    }

    const canonService = new CanonService();
    const walletHex = session.walletAddress.replace(/^0x/, '');
    const syntheticSessionId =
      `session_${'0'.repeat(128 - walletHex.length)}${walletHex}` as `session_${string}`;

    const existing = await canonService.getUserByWalletAddress(session.walletAddress);
    let user;

    if (existing) {
      const needsSlugUpdate =
        session.username && existing.publicSlug.startsWith('0x');
      let newSlug: string | undefined;
      if (needsSlugUpdate) {
        const baseSlug = slugifyCrateUserName(session.username!);
        newSlug = baseSlug;
        let attempt = 0;
        while (await canonService.isSlugTaken(newSlug)) {
          attempt += 1;
          newSlug = `${baseSlug}-${attempt}`;
        }
      }

      user = await canonService.updateBoundUser(existing.id, {
        worldSessionId: syntheticSessionId,
        publicSlug: newSlug,
        walletAddress: session.walletAddress,
        username: session.username,
        verificationLevel: 'dev_bypass',
      });
    } else {
      const baseSlug = slugifyCrateUserName(session.username ?? session.walletAddress);
      let slug = baseSlug;
      let attempt = 0;
      while (await canonService.isSlugTaken(slug)) {
        attempt += 1;
        slug = `${baseSlug}-${attempt}`;
      }

      user = await canonService.createBoundUser({
        worldSessionId: syntheticSessionId,
        publicSlug: slug,
        walletAddress: session.walletAddress,
        username: session.username,
        verificationLevel: 'dev_bypass',
      });
    }

    await createSessionCookie({
      ...session,
      worldSessionId: syntheticSessionId,
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
