import { registerAs } from '@nestjs/config';

type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  synchronize: boolean;
  logging: boolean;
};

type AppConfig = {
  database: DatabaseConfig;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  switch (value.toLowerCase()) {
    case 'true':
    case '1':
    case 'yes':
      return true;
    case 'false':
    case '0':
    case 'no':
      return false;
    default:
      return fallback;
  }
};

export default registerAs(
  'config',
  (): AppConfig => ({
    database: {
      host: process.env.DATABASE_HOST || 'db',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'eventlook',
      password: process.env.DATABASE_PASSWORD || 'eventlook',
      name: process.env.DATABASE_NAME || 'eventlook',
      synchronize: parseBoolean(
        process.env.DATABASE_SYNCHRONIZE,
        process.env.NODE_ENV !== 'production'
      ),
      logging: parseBoolean(process.env.TYPEORM_LOGGING, false)
    }
  })
);
