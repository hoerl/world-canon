import { CanonService } from '@/features/canon/canon-service';
import { TasteProxyPage } from '@/features/demo/components/taste-proxy-page';
import { getOptionalSession } from '@/lib/session';

export default async function DemoTasteProxyPage() {
  const session = await getOptionalSession();

  let defaultSlug: string | null = null;
  if (session?.worldSessionId) {
    const canon = await new CanonService().getCanonByWorldSessionId(
      session.worldSessionId,
    );
    defaultSlug = canon?.slug ?? null;
  }

  return <TasteProxyPage defaultSlug={defaultSlug} />;
}
