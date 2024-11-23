import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { join } from "path";
import { DataSource, DataSourceOptions } from "typeorm";

dotenvConfig({ path: '.env' });

const config = {
    type: process.env.DB_TYPE as 'postgres',
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT, 10),
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB,
    entities: [join(__dirname, '/../**/*.entity{.ts,.js}')], // Handles src and dist paths
    autoLoadEntities: true,
    synchronize: false,
}

export default registerAs('typeOrmConfig', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions);
