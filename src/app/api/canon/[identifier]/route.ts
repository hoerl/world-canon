import { CanonService } from '@/features/canon/canon-service';
import { canonSlotInputSchema, isCanonCategory } from '@/features/canon/domain';
import { HttpError, jsonOk, handleRouteError } from '@/lib/http';
import { getOptionalSession } from '@/lib/session';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ identifier: string }> },
) {
  try {
    const { identifier } = await params;
    const canon = await new CanonService().getCanonBySlug(identifier);
    if (!canon) {
      throw new HttpError(404, 'Crate not found');
    }

    return jsonOk(canon);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ identifier: string }> },
) {
  try {
    const { identifier } = await params;
    if (!isCanonCategory(identifier)) {
      throw new HttpError(400, 'Invalid canon category');
    }

    const session = await getOptionalSession();
    if (!session) {
      throw new HttpError(401, 'Unauthorized');
    }

    if (!session.worldSessionId) {
      throw new HttpError(403, 'World ID binding required');
    }

    const parsed = canonSlotInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new HttpError(400, 'Invalid canon slot payload');
    }

    const canon = await new CanonService().upsertCanonSlot(
      session.worldSessionId,
      identifier,
      parsed.data,
    );

    return jsonOk(canon);
  } catch (error) {
    return handleRouteError(error);
  }
}
