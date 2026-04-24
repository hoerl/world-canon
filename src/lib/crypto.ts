import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

function getKey(secret: string) {
  return createHash('sha256').update(secret).digest();
}

export function encryptSecret(plainText: string, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('base64url'), encrypted.toString('base64url'), authTag.toString('base64url')].join('.');
}

export function decryptSecret(payload: string, secret: string) {
  const [ivPart, encryptedPart, authTagPart] = payload.split('.');
  if (!ivPart || !encryptedPart || !authTagPart) {
    throw new Error('Malformed encrypted payload');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getKey(secret),
    Buffer.from(ivPart, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(authTagPart, 'base64url'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'base64url')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export function canonicalJsonStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJsonStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  return `{${entries
    .map(([key, nestedValue]) => `${JSON.stringify(key)}:${canonicalJsonStringify(nestedValue)}`)
    .join(',')}}`;
}
