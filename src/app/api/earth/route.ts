import { EarthService } from '@/features/earth/earth-service';
import { jsonOk, handleRouteError } from '@/lib/http';

export async function GET() {
  try {
    return jsonOk(await new EarthService().listEarthCanon());
  } catch (error) {
    return handleRouteError(error);
  }
}
