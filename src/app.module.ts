import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { config as dotenvConfig } from 'dotenv';
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./user/user.module";
import { ApolloDriver } from "@nestjs/apollo";
import { setLog } from "./common/logger.helper";
import { ConfigService } from "@nestjs/config";

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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => (configService.get('typeorm'))
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