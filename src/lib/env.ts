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
