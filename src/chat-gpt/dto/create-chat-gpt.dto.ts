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
}
