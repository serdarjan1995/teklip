import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailingService } from './mailing.service';
import { MailingController } from './mailing.controller';

@Module({
  controllers: [MailingController],
  providers: [MailingService, ConfigService],
  exports: [MailingService],
})
export class MailingModule {}
