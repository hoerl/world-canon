import { CanonService } from '@/features/canon/canon-service';
import { ShopperPage } from '@/features/demo/components/shopper-page';
import { getOptionalSession } from '@/lib/session';

export default async function DemoShopperPage() {
  const session = await getOptionalSession();

  let defaultSlug: string | null = null;
  if (session?.worldSessionId) {
    const canon = await new CanonService().getCanonByWorldSessionId(
      session.worldSessionId,
    );
    defaultSlug = canon?.slug ?? null;
  }

  return <ShopperPage defaultSlug={defaultSlug} />;
}
