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

    return {
      rp_id: getRequiredEnv('RP_ID'),
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
      throw new HttpError(400, 'Invalid World ID session proof');
    }

    const verifyResponse = await fetch(
      `https://developer.world.org/api/v4/verify/${getRequiredEnv('RP_ID')}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      },
    );

    const verifyPayload = (await verifyResponse.json().catch(() => null)) as
      | {
          detail?: string;
          code?: string;
        }
      | null;

    if (!verifyResponse.ok) {
      throw new HttpError(
        verifyResponse.status,
        verifyPayload?.detail ?? 'World ID verification failed',
      );
    }

    const existingUser = await this.canonService.getUserByWorldSessionId(parsed.data.session_id);
    if (existingUser) {
      return this.canonService.updateBoundUser(existingUser.id, {
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
