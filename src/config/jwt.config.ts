import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresInSeconds: number;
  expiresInMs: number;
}

const DEFAULT_SECRET = 'change-me';
const DEFAULT_EXPIRES_IN = '7d';

function parseDurationToMs(input: string | number): number {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input * 1000; // treat as seconds
  }

  const value = String(input).trim();

  const directNumber = Number(value);
  if (!Number.isNaN(directNumber) && directNumber > 0) {
    return directNumber * 1000;
  }

  const match = value.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // fallback to 7 days
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export default registerAs('jwt', (): JwtConfig => {
  const secret = process.env.JWT_SECRET?.trim() || DEFAULT_SECRET;
  const expiresRaw =
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN?.trim() || DEFAULT_EXPIRES_IN;
  const expiresInMs = parseDurationToMs(expiresRaw);

  return {
    secret,
    expiresInSeconds: Math.floor(expiresInMs / 1000),
    expiresInMs,
  };
});
