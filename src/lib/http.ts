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
    return jsonError(error.status, error.message);
  }

  if (error instanceof Error) {
    return jsonError(500, error.message);
  }

  return jsonError(500, 'Unknown server error');
}
