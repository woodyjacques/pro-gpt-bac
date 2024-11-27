import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class chat_gpt {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    email: string;
    @Column()
    titulo: string;
    @Column()
    descripcion: string;
    @Column()
    metas?: string;
    @Column() 
    favorito: boolean;
}