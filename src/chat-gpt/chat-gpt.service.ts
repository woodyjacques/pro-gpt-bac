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
      Actúa como un asistente experto en la creación de propuestas de negocios y genera una propuesta de alta calidad, estructurada y detallada para presentar a un cliente potencial. La propuesta debe utilizar un estilo claro y profesional sin asteriscos, negritas ni formato markdown. Incluye todos los datos proporcionados y divide la propuesta en las siguientes secciones:
  
      Propuesta de Negocio: ${titulo}
  
      Introducción:
      Introduce el proyecto "${titulo}" destacando su importancia y propósito dentro del mercado o comunidad objetivo. Explica de manera atractiva cómo este proyecto responde a una necesidad o problema existente. Enfatiza la visión general del proyecto y cómo podría tener un impacto positivo en el crecimiento o bienestar del cliente. Explica también la alineación del proyecto con los valores de ${nombreEmpresa}, y resalta la oportunidad única de colaboración con ${nombreCliente}.
  
      Descripción detallada del proyecto:
      Expón en detalle los elementos clave del proyecto: "${descripcion}". Describe los productos o servicios principales que se ofrecerán, incluyendo especificaciones únicas o innovaciones que lo diferencian de la competencia. Menciona las estrategias que se emplearán para asegurar que el proyecto destaque en el mercado, incluyendo métodos de operación, distribución, y control de calidad. Si es posible, detalla cómo el proyecto abordará los desafíos específicos del mercado actual y cómo estas soluciones incrementarán su valor. Proporciona ejemplos o escenarios que permitan visualizar el éxito potencial del proyecto.
  
      Objetivos específicos:
      Define los objetivos clave que se esperan alcanzar a lo largo del proyecto. Incluye una lista de metas, como:
      1. ${metas}.
      Para cada objetivo, explica cómo este beneficiará directamente al cliente y los usuarios finales. Expón los resultados esperados y cualquier ventaja adicional que cada meta pueda ofrecer a largo plazo. Incluye además métricas de éxito o indicadores de rendimiento que se podrían usar para evaluar el avance del proyecto.
  
      Presupuesto detallado:
      El presupuesto total para este proyecto es de ${presupuesto}. Ofrece un desglose de los costos clave en partidas, como adquisición de maquinaria, marketing, distribución, recursos humanos, y logística. Para cada área, explica cómo cada inversión respalda los objetivos generales del proyecto y contribuye a su viabilidad a largo plazo. Destaca también cualquier posible optimización o eficiencia en costos que se esté contemplando para maximizar el rendimiento de la inversión. Considera agregar ejemplos de costos en proyectos similares si es posible para dar contexto al cliente.
  
      Impacto a largo plazo y beneficios:
      Añade una sección que destaque los beneficios a largo plazo que este proyecto ofrecerá al cliente, como oportunidades de expansión, reconocimiento de marca, y sostenibilidad en el mercado. Explica cómo este proyecto podría abrir puertas para futuras colaboraciones o para el crecimiento de la empresa en nuevas áreas. Menciona también los beneficios de trabajar con un equipo comprometido y experimentado que prioriza el éxito y la satisfacción del cliente.
  
      Datos de contacto del cliente:
      Cliente: ${nombreCliente}.
      Empresa: ${nombreEmpresa}.
      Teléfono de contacto: ${telefono}.
      Correo electrónico: ${correo}.
      
      Crea una propuesta profesional, detallada y convincente que despierte el interés del cliente en el proyecto y fomente una colaboración exitosa. Finaliza con un llamado a la acción invitando al cliente a discutir la propuesta en una reunión para detallar cualquier ajuste o solicitud adicional.
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
        email, titulo, descripcion: generatedDescription, metas, presupuesto, tono, nombreCliente, nombreEmpresa, telefono, correo, favorito: false
      });

      await this.chatRepository.save(newChat);

      console.log(generatedDescription);

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



