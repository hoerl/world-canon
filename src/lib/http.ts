import { NextResponse } from 'next/server';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json(
    {
      error,
      details,
    },
    { status },
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof HttpError) {
    console.error(`[API Error ${error.status}]`, error.message);
    return jsonError(error.status, error.message);
  }

  if (error instanceof Error) {
    console.error('[API Error 500]', error.message, error.stack);
    return jsonError(500, error.message);
  }

  console.error('[API Error 500] Unknown:', error);
  return jsonError(500, 'Unknown server error');
}
