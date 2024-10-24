import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatGptDto } from './dto/create-chat-gpt.dto';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { chat_gpt } from './entities/chat-gpt.entity';
import 'dotenv/config';

@Injectable()
export class ChatGptService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(chat_gpt) private readonly chatRepository: Repository<chat_gpt>,
  ) { }

  async create(createChatDto: CreateChatGptDto): Promise<string> {
    const { email, titulo, descripcion, metas, presupuesto, tono, nombreCliente, nombreEmpresa, telefono, correo } = createChatDto;

    const prompt = `
      Quiero que actúes como un asistente especializado en la creación de propuestas de negocios. 
      Con los siguientes datos: 
      - Título del proyecto: ${titulo}
      - Descripción: ${descripcion}
      - Metas: ${metas}
      - Presupuesto: ${presupuesto}
      - Tono: ${tono}
      - Nombre del cliente: ${nombreCliente}
      - Nombre de la empresa: ${nombreEmpresa}
      - Teléfono de contacto: ${telefono}
      - Correo electrónico: ${correo}
      
      Con esta información, genera una propuesta de negocio profesional que incluya una introducción, una descripción detallada del proyecto, el presupuesto detallado, los objetivos específicos y los datos de contacto del cliente. 
    `;

    try {
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: "Actúa como un asistente especializado en la creación de propuestas de negocios." },
              { role: 'user', content: prompt },
            ],
            max_tokens: 1500,
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_TOKEN}`
            }
          },
        ),
      );

      const generatedDescription = response.data.choices[0].message.content.trim();

      const newChat = this.chatRepository.create({
        email, titulo, descripcion: generatedDescription, metas, presupuesto, tono, nombreCliente, nombreEmpresa, telefono, correo, favorito: false
      });

      await this.chatRepository.save(newChat);

      return generatedDescription;

    } catch (error) {
      if (error.response) {
        console.error('Error al conectar con la API de ChatGPT:', error.response.data);
      } else {
        console.error('Error de conexión con la API de ChatGPT:', error.message);
      }
      throw new Error('No se pudo generar la propuesta de negocio en este momento.');
    }
  }

  async findAllByEmail(email: string) {
    const proposals = await this.chatRepository.find({ where: { email } });

    if (!proposals.length) {
      throw new NotFoundException(`No existen propuestas para este correo`);
    }

    return proposals;
  }

  async remove(id: number) {
    const existingPro = await this.chatRepository.findOne({ where: { id } });

    if (!existingPro) {
      throw new NotFoundException(`La propuesta con el ID ${id} no existe`);
    }

    await this.chatRepository.remove(existingPro);
    return existingPro;
  }

  async findPropuestaById(id: number) {
    return await this.chatRepository.findOne({ where: { id } });
  }

  async updateFavorito(id: number, favorito: boolean, email: string) {
    const propuesta = await this.findPropuestaById(id);
    if (!propuesta) {
      throw new NotFoundException(`Propuesta con ID ${id} no encontrada`);
    }

    if (propuesta.email !== email) {
      throw new NotFoundException(`El email proporcionado no coincide con el email del propietario de la propuesta`);
    }

    propuesta.favorito = favorito;

    await this.chatRepository.save(propuesta); 

    return {
      message: `La propuesta con ID ${id} ha sido actualizada exitosamente`,
    };
  }
}  



