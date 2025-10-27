export interface DatabaseConfig {
  /**
   * Fully qualified MongoDB connection string.
   */
  readonly uri: string;
}

const DEFAULTS = {
  host: '127.0.0.1',
  port: '27017',
  dbName: 'food-delivery-users',
} as const;

const normalize = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const getDatabaseConfig = (): DatabaseConfig => {
  const rawUri = normalize(process.env.MONGODB_URI);

  if (rawUri) {
    return { uri: rawUri };
  }

  const host = normalize(process.env.MONGODB_HOST) ?? DEFAULTS.host;
  const port = normalize(process.env.MONGODB_PORT) ?? DEFAULTS.port;
  const dbName = normalize(process.env.MONGODB_DB) ?? DEFAULTS.dbName;

  return {
    uri: `mongodb://${host}:${port}/${dbName}`,
  };
};
