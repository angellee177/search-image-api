import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { config as dotenvConfig } from 'dotenv';
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./user/user.module";
import { ApolloDriver } from "@nestjs/apollo";
import { setLog } from "./common/logger.helper";

dotenvConfig({ path: '.env' });

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      csrfPrevention: true, // Enable CSRF prevention
      context: ({ req }) => ({ headers: req.headers }), // Pass headers for context
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as 'postgres',
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT, 10),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {
  configure(): void {
    setLog({
      level: "info",
      method: "AppModule.ts",
      message: `Apps runnng in Environment: ${process.env.NODE_ENV}`
    })
  }
}