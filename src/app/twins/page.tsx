import { CanonService } from '@/features/canon/canon-service';
import { TwinsPage } from '@/features/twins/components/twins-page';
import { getOptionalSession } from '@/lib/session';

export default async function TwinsRoute() {
  const session = await getOptionalSession();
  const canonService = new CanonService();

  const canon = session?.worldSessionId
    ? await canonService.getCanonByWorldSessionId(session.worldSessionId)
    : null;

  const hasCrate = canon !== null && Object.values(canon.canon).some((slot) => slot !== null);

  return (
    <TwinsPage
      session={
        session
          ? {
              username: session.username,
              worldSessionId: session.worldSessionId,
            }
          : null
      }
      mySlug={canon?.slug ?? null}
      hasCrate={hasCrate}
    />
  );
}
