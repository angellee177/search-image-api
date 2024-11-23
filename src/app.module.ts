import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { config as dotenvConfig } from 'dotenv';
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./user/user.module";
import { ApolloDriver } from "@nestjs/apollo";
import { setLog } from "./common/logger.helper";
import { ConfigService, ConfigModule } from "@nestjs/config";
import { ImagesModule } from "./image/image.module";
import typeOrmConfig from './config/typeorm';

dotenvConfig({ path: '.env' });

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true, // Ensure it's available globally
      load: [typeOrmConfig], // Load the TypeORM configuration
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      debug: true, // i need to make sure the resolver are registered
      csrfPrevention: true, // Enable CSRF prevention
      context: ({ req }) => ({ headers: req.headers }), // Pass headers for context
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => (configService.get('typeOrmConfig'))
    }),
    AuthModule,
    UsersModule,
    ImagesModule,
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