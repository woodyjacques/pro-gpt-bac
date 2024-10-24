import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { userprogpt } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(userprogpt)
    private readonly usersRepository: Repository<userprogpt>
  ) { }

  async create(createUserDto: CreateUserDto) {
    return await this.usersRepository.save(createUserDto);
  }

  async findOneByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async updateVerifi(email: string, isVerified: boolean) {
    const user = await this.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    await this.usersRepository.update({ email }, { isVerified: true });
  }

  async updatePasswordEmail(email: string, password: string) {
    const user = await this.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    await this.usersRepository.update({ email }, { password: password });
  }

}
