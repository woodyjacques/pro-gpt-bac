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
    const { email, descripcion, metas } = createChatDto;

    const prompt = `
Actúa como un asistente especializado en la creación de propuestas de negocios.
Por favor, crea una propuesta detallada siguiendo este modelo, **y sin utilizar asteriscos (*), guiones (-), ni ningún tipo de formato de texto (como negritas, listas con viñetas, etc.)**:

1. Introducción:
   Comienza con una introducción dirigida al cliente. Explica brevemente la importancia de los servicios ofrecidos y cómo estos ayudarán a alcanzar los objetivos del cliente.

2. Objetivo:
   Define el objetivo principal de la propuesta de forma clara y específica.

3. Servicios ofrecidos:
   Divide los servicios en secciones, cada una con:
     - Un título descriptivo.
     - Detalles del servicio (qué incluye, beneficios y cómo se implementará).
     - Plazo estimado de entrega.
     - Costo aproximado.

4. Beneficios clave:
   Resalta los beneficios más importantes que el cliente obtendrá al aceptar la propuesta.

5. Conclusión:
   Termina con una conclusión.

Basado en los siguientes datos proporcionados:
- Descripción del proyecto: ${descripcion}
- Metas: ${metas}
`;


    const titulo = `Propuesta Integral: ${metas.split(" ")[0]} para ${email.split("@")[0]}`;

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
            max_tokens: 2000,
            temperature: 0.9,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_TOKEN}`
            }
          },
        ),
      );

      let generatedDescription = response.data.choices[0].message?.content?.trim() || 'No se generó contenido válido.';

      generatedDescription = generatedDescription
        .replace(/\bundefined\b/gi, '')
        .replace(/(\n|^)\s*[a-z]\s*(\n|$)/gi, '')
        .replace(/\s+$/, '')
        .trim();

      if (/undefined/i.test(generatedDescription)) {
        console.warn("Texto generado contiene 'undefined'. Ajuste o reintento necesario.");
        throw new Error('La propuesta generada contiene valores inválidos.');
      }

      const newChat = this.chatRepository.create({
        email, titulo, descripcion: generatedDescription, metas, favorito: false
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



