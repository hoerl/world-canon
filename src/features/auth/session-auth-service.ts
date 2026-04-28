import { CANON_SIGN_IN_STATEMENT } from '@/features/auth/constants';
import { CanonService } from '@/features/canon/canon-service';
import { AppSession, consumeWalletNonce } from '@/lib/session';
import { HttpError } from '@/lib/http';
import { verifySiweMessage } from '@worldcoin/minikit-js/siwe';
import { z } from 'zod';

const walletAuthPayloadSchema = z.object({
  address: z.string().startsWith('0x'),
  message: z.string().min(1),
  signature: z.string().min(1),
  version: z.number().optional(),
});

const profileSchema = z.object({
  username: z.string().trim().min(1).max(64).nullable().optional(),
  profilePictureUrl: z.string().url().nullable().optional(),
});

const completeWalletAuthSchema = z.object({
  payload: walletAuthPayloadSchema,
  profile: profileSchema.optional(),
});

export type CompleteWalletAuthInput = z.infer<typeof completeWalletAuthSchema>;

export class SessionAuthService {
  constructor(private readonly canonService = new CanonService()) {}

  async completeWalletAuth(input: unknown): Promise<AppSession> {
    const parsed = completeWalletAuthSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(400, 'Invalid wallet auth payload');
    }

    const nonce = await consumeWalletNonce();
    if (!nonce) {
      throw new HttpError(400, 'Wallet auth nonce expired');
    }

    const verification = await verifySiweMessage(
      parsed.data.payload,
      nonce,
      CANON_SIGN_IN_STATEMENT,
    );

    if (!verification.isValid || !verification.siweMessageData.address) {
      throw new HttpError(401, 'Wallet authentication failed');
    }

    const existingUser = await this.canonService.getUserByWalletAddress(parsed.data.payload.address);
    const username = parsed.data.profile?.username ?? existingUser?.worldUsername ?? null;

    if (existingUser && username && !existingUser.worldUsername) {
      await this.canonService.updateBoundUser(existingUser.id, {
        username,
        walletAddress: existingUser.walletAddress,
        verificationLevel: existingUser.verificationLevel,
      });
    }

    return {
      walletAddress: parsed.data.payload.address,
      username,
      profilePictureUrl: parsed.data.profile?.profilePictureUrl ?? null,
      worldSessionId: existingUser?.worldSessionId
        ? (existingUser.worldSessionId as `session_${string}`)
        : null,
    };
  }
}
