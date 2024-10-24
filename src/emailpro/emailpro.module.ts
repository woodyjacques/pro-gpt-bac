import { Module } from '@nestjs/common';
import { EmailproService } from './emailpro.service';
import { EmailproController } from './emailpro.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from "../auth/mailer.config";

@Module({
  imports: [
    MailerModule.forRoot(mailerConfig)
  ],
  controllers: [EmailproController],
  providers: [EmailproService],
  exports: [MailerModule,EmailproService]
})
export class EmailproModule {}
