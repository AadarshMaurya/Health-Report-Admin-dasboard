import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the .env file in the workspace
dotenv.config({ path: path.join(__dirname, '../../.env') });

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [
    path.join(__dirname, '../entities/**/*.entity{.ts,.js}'),
  ],
  migrations: [
    path.join(__dirname, '../migrations/**/*{.ts,.js}'),
  ],
  synchronize: false,
});
