import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MailerModule } from "@nestjs-modules/mailer"
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "src/users/users.module";
import { jwtConstants } from "./constants/jwt.constant";
import { mailerConfig } from "./mailer.config";

@Module({
  imports: [
    MailerModule.forRoot(mailerConfig),
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [MailerModule,AuthService]
})
export class AuthModule { }


