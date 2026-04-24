import { HomePage } from '@/features/earth/components/home-page';
import { EarthService } from '@/features/earth/earth-service';
import { getOptionalSession } from '@/lib/session';

export default async function Page() {
  const earth = await new EarthService().listEarthCanon();
  const session = await getOptionalSession();

  return (
    <HomePage
      earth={earth}
      session={session ? { username: session.username } : null}
    />
  );
}
