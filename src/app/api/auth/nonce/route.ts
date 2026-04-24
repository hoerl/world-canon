import { jsonOk, handleRouteError } from '@/lib/http';
import { issueWalletNonce } from '@/lib/session';

export async function GET() {
  try {
    const nonce = await issueWalletNonce();
    return jsonOk({ nonce });
  } catch (error) {
    return handleRouteError(error);
  }
}
