export type WorldEnvironment = 'production' | 'staging';

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function getRequiredEnv(name: string) {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getDatabaseUrl() {
  return readEnv('DATABASE_URL');
}

export function hasDatabase() {
  return Boolean(getDatabaseUrl());
}

export function getPublicWorldEnvironment(): WorldEnvironment {
  return readEnv('NEXT_PUBLIC_WORLD_ENV') === 'production'
    ? 'production'
    : 'staging';
}

export function isDemoSeedEnabled() {
  return readEnv('DEMO_SEED_ENABLED') === 'true';
}

export function getAgentBookRpcUrl() {
  return readEnv('WORLD_AGENTBOOK_RPC_URL');
}

export function getPublicAppId() {
  return readEnv('NEXT_PUBLIC_APP_ID');
}

export type ConfigCheck = { key: string; ok: boolean; message: string };

export function validateWorldIdConfig(): ConfigCheck[] {
  const checks: ConfigCheck[] = [];

  const appId = readEnv('NEXT_PUBLIC_APP_ID');
  if (!appId) checks.push({ key: 'NEXT_PUBLIC_APP_ID', ok: false, message: 'Not set' });
  else if (!appId.startsWith('app_'))
    checks.push({ key: 'NEXT_PUBLIC_APP_ID', ok: false, message: `Bad prefix: "${appId.slice(0, 8)}"` });
  else checks.push({ key: 'NEXT_PUBLIC_APP_ID', ok: true, message: 'OK' });

  const rpId = readEnv('RP_ID');
  if (!rpId) checks.push({ key: 'RP_ID', ok: false, message: 'Not set' });
  else if (!rpId.startsWith('rp_'))
    checks.push({ key: 'RP_ID', ok: false, message: `Bad prefix: "${rpId.slice(0, 8)}"` });
  else checks.push({ key: 'RP_ID', ok: true, message: 'OK' });

  const rpKey = readEnv('RP_SIGNING_KEY');
  if (!rpKey) checks.push({ key: 'RP_SIGNING_KEY', ok: false, message: 'Not set' });
  else if (!/^[0-9a-f]{64}$/i.test(rpKey))
    checks.push({ key: 'RP_SIGNING_KEY', ok: false, message: `Unexpected length or format (${rpKey.length} chars)` });
  else checks.push({ key: 'RP_SIGNING_KEY', ok: true, message: 'OK' });

  const authSecret = readEnv('AUTH_SECRET');
  if (!authSecret) checks.push({ key: 'AUTH_SECRET', ok: false, message: 'Not set' });
  else if (authSecret.includes('<run:') || authSecret.includes('openssl'))
    checks.push({ key: 'AUTH_SECRET', ok: false, message: 'Contains placeholder — run: openssl rand -hex 32' });
  else checks.push({ key: 'AUTH_SECRET', ok: true, message: 'OK' });

  const worldEnv = readEnv('NEXT_PUBLIC_WORLD_ENV');
  checks.push({ key: 'NEXT_PUBLIC_WORLD_ENV', ok: Boolean(worldEnv), message: worldEnv ?? 'Not set' });

  return checks;
}
