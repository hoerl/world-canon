import { PublicCanonPage } from '@/features/canon/components/public-canon-page';
import { CanonService } from '@/features/canon/canon-service';
import { getOptionalSession } from '@/lib/session';
import { notFound } from 'next/navigation';

export default async function PublicCanonRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const canon = await new CanonService().getCanonBySlug(slug);

  if (!canon) {
    notFound();
  }

  const session = await getOptionalSession();

  return (
    <PublicCanonPage canon={canon} viewerCanAddToMine={Boolean(session?.worldSessionId)} />
  );
}
