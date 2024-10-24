import { Controller, Post, Body } from '@nestjs/common';
import { EmailproService } from './emailpro.service';

@Controller('emailpro')
export class EmailproController {
  constructor(private readonly emailproService: EmailproService) {}

  @Post()
  create(@Body() body: { text: string; email: string; emailUser:string; }) {
    return this.emailproService.create(body);
  }
}
