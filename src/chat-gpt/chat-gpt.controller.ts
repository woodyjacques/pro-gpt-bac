import { Controller, Post, Body, Get, Delete, Patch, Param } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';
import { CreateChatGptDto } from './dto/create-chat-gpt.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Chat-gpt')
@Controller('chat-gpt')
export class ChatGptController {
  constructor(private readonly chatGptService: ChatGptService) {}

  @Post()
  async create(@Body() createChatGptDto: CreateChatGptDto) {
    const generatedDescription = await this.chatGptService.create(createChatGptDto);
    return { message: generatedDescription };
  }

  @Get(':email')
  findById(@Param('email') email: string) {
    return this.chatGptService.findAllByEmail(email);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.chatGptService.remove(id);
  }

  @Patch(':id')
  async updateFavorito(@Param('id') id: number, @Body() updateData: { favorito: boolean; email: string }) {
    const { favorito, email } = updateData;
    return this.chatGptService.updateFavorito(id, favorito, email);
  }
}
