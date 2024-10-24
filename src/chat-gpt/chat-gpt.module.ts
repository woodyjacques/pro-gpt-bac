import { Module } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';
import { ChatGptController } from './chat-gpt.controller';
import { chat_gpt } from './entities/chat-gpt.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([chat_gpt]),
    HttpModule,
  ],
  controllers: [ChatGptController],
  providers: [ChatGptService],
  exports: [ChatGptService],
})
export class ChatGptModule {}
