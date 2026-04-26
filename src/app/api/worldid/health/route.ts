import { validateWorldIdConfig, getPublicWorldEnvironment } from '@/lib/env';
import { jsonOk, jsonError } from '@/lib/http';
import { signRequest } from '@worldcoin/idkit';

export async function GET() {
  if (getPublicWorldEnvironment() === 'production') {
    return jsonError(404, 'Not found');
  }

  const configChecks = validateWorldIdConfig();
  const allConfigOk = configChecks.every((c) => c.ok);

  let signatureTest: { ok: boolean; message: string; details?: Record<string, unknown> } = {
    ok: false,
    message: 'Skipped — config invalid',
  };

  if (allConfigOk) {
    try {
      const rpKeyCheck = configChecks.find((c) => c.key === 'RP_SIGNING_KEY');
      if (rpKeyCheck?.ok) {
        const sig = signRequest({ signingKeyHex: process.env.RP_SIGNING_KEY! });
        const now = Math.floor(Date.now() / 1000);
        signatureTest = {
          ok: Boolean(sig.sig && sig.nonce && sig.createdAt && sig.expiresAt),
          message: 'Signature generated successfully',
          details: {
            has_sig: Boolean(sig.sig),
            has_nonce: Boolean(sig.nonce),
            created_at: sig.createdAt,
            expires_at: sig.expiresAt,
            ttl_seconds: sig.expiresAt - sig.createdAt,
            server_now: now,
            clock_drift_seconds: now - sig.createdAt,
          },
        };
      }
    } catch (error) {
      signatureTest = {
        ok: false,
        message: error instanceof Error ? error.message : 'signRequest threw',
      };
    }
  }

  return jsonOk({
    environment: getPublicWorldEnvironment(),
    config: configChecks,
    signature_test: signatureTest,
    healthy: allConfigOk && signatureTest.ok,
  });
}
