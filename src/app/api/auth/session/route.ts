import { jsonOk, handleRouteError } from '@/lib/http';
import { getOptionalSession } from '@/lib/session';

export async function GET() {
  try {
    return jsonOk({ session: await getOptionalSession() });
  } catch (error) {
    return handleRouteError(error);
  }
}
