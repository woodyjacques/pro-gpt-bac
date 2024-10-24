import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailproService {
  constructor(private readonly mailerService: MailerService) {}

  async create(data: { text: string; email: string; emailUser: string }) {
    const { text, email, emailUser } = data;
    const url = `https://briefly1.netlify.app/login`;
    const filePath = path.resolve(process.cwd(), 'src/auth/html/plantillaPro.html');

    const htmlTemplate = fs.readFileSync(filePath, 'utf8');
    const personalizedHtml = htmlTemplate
      .replace('{{name}}', emailUser)
      .replace('{{token}}', url)
      .replace('{{text}}', text)
      .replace('{{email}}', email);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Correo de mensaje',
      html: personalizedHtml,
    });

    return { message: 'Correo enviado correctamente' };
  }
}
