import { CanonService } from '@/features/canon/canon-service';
import { slugifyCrateUserName } from '@/features/canon/domain';
import { getRequiredEnv } from '@/lib/env';
import { HttpError } from '@/lib/http';
import { signRequest } from '@worldcoin/idkit';
import { z } from 'zod';

const sessionProofSchema = z.object({
  protocol_version: z.literal('4.0'),
  session_id: z.string().startsWith('session_'),
  nonce: z.string().min(1),
  responses: z.array(z.any()).min(1),
  environment: z.string(),
  action_description: z.string().optional(),
});

export class HumanBindingService {
  constructor(private readonly canonService = new CanonService()) {}

  createRpContext() {
    const signature = signRequest({
      signingKeyHex: getRequiredEnv('RP_SIGNING_KEY'),
    });

    const rpId = getRequiredEnv('RP_ID');
    const now = Math.floor(Date.now() / 1000);
    console.log('[worldid/rp-context] Generated RP signature', {
      rp_id: rpId,
      created_at: signature.createdAt,
      expires_at: signature.expiresAt,
      ttl_seconds: signature.expiresAt - signature.createdAt,
      server_now: now,
      clock_drift: now - signature.createdAt,
    });

    return {
      rp_id: rpId,
      nonce: signature.nonce,
      created_at: signature.createdAt,
      expires_at: signature.expiresAt,
      signature: signature.sig,
    };
  }

  async verifyAndBindSessionProof(
    rawProof: unknown,
    walletSession: {
      walletAddress: string;
      username: string | null;
      profilePictureUrl: string | null;
    },
  ) {
    const parsed = sessionProofSchema.safeParse(rawProof);
    if (!parsed.success) {
      console.error('[worldid/verify] Schema validation failed', parsed.error.flatten());
      throw new HttpError(400, 'Invalid World ID session proof');
    }

    const rpId = getRequiredEnv('RP_ID');
    const verifyUrl = `https://developer.world.org/api/v4/verify/${rpId}`;
    console.log('[worldid/verify] Forwarding to World API', {
      url: verifyUrl,
      protocol_version: parsed.data.protocol_version,
      session_id: parsed.data.session_id,
      environment: parsed.data.environment,
      responses: parsed.data.responses.length,
    });

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(parsed.data),
    });

    const verifyPayload = (await verifyResponse.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    console.log('[worldid/verify] World API response', {
      status: verifyResponse.status,
      ok: verifyResponse.ok,
      payload: verifyPayload,
    });

    if (!verifyResponse.ok) {
      const detail =
        (verifyPayload?.detail as string) ??
        (verifyPayload?.message as string) ??
        (verifyPayload?.code as string) ??
        'World ID verification failed';
      throw new HttpError(verifyResponse.status, `${detail} (HTTP ${verifyResponse.status})`);
    }

    const existingUser = await this.canonService.getUserByWorldSessionId(parsed.data.session_id);
    if (existingUser) {
      const needsSlugUpdate =
        walletSession.username && existingUser.publicSlug.startsWith('0x');
      let newSlug: string | undefined;
      if (needsSlugUpdate) {
        newSlug = await this.reserveSlug(
          slugifyCrateUserName(walletSession.username!),
        );
      }

      return this.canonService.updateBoundUser(existingUser.id, {
        publicSlug: newSlug,
        walletAddress: walletSession.walletAddress,
        username: walletSession.username,
        verificationLevel: 'proof_of_human',
      });
    }

    const publicSlug = await this.reserveSlug(
      slugifyCrateUserName(walletSession.username ?? walletSession.walletAddress),
    );

    return this.canonService.createBoundUser({
      worldSessionId: parsed.data.session_id as `session_${string}`,
      publicSlug,
      walletAddress: walletSession.walletAddress,
      username: walletSession.username,
      verificationLevel: 'proof_of_human',
    });
  }

  private async reserveSlug(baseSlug: string) {
    let attempt = 0;
    let candidate = baseSlug;

    while (await this.canonService.isSlugTaken(candidate)) {
      attempt += 1;
      candidate = `${baseSlug}-${attempt}`;
    }

    return candidate;
  }
}
