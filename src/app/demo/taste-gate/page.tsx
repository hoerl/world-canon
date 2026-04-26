import { CanonService } from '@/features/canon/canon-service';
import { TasteGatePage } from '@/features/demo/components/taste-gate-page';
import { getOptionalSession } from '@/lib/session';

export default async function DemoTasteGatePage() {
  const session = await getOptionalSession();

  let defaultSlug: string | null = null;
  if (session?.worldSessionId) {
    const canon = await new CanonService().getCanonByWorldSessionId(
      session.worldSessionId,
    );
    defaultSlug = canon?.slug ?? null;
  }

  return <TasteGatePage defaultSlug={defaultSlug} />;
}
