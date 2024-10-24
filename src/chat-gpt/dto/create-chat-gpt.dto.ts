import { ApiProperty } from '@nestjs/swagger';

export class CreateChatGptDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    titulo: string;
    @ApiProperty()
    descripcion:string;
    @ApiProperty()
    metas:string;
    @ApiProperty()
    presupuesto:string;
    @ApiProperty()
    tono:string;
    @ApiProperty()
    nombreCliente:string;
    @ApiProperty()
    nombreEmpresa:string;
    @ApiProperty()
    telefono:string;
    @ApiProperty()
    correo:string;
}
