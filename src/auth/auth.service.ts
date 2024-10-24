import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { MailerService } from "@nestjs-modules/mailer"
import { JwtService } from "@nestjs/jwt";
import * as bcryptjs from "bcryptjs";
import { UsersService } from "src/users/users.service";
import * as path from 'path';
import * as fs from 'fs';
import { LoginDto } from "./dto/login.dto";
import { EmailDto, PassEmailDto } from "./dto/pass.dto";

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService
  ) { }

  async register({ password, email, name, isVerified }: RegisterDto) {
    const user = await this.usersService.findOneByEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

    if (user) {
      throw new BadRequestException("Correo electrónico ya existe.");
    }

    if (!emailRegex.test(email)) {
      throw new BadRequestException("Ingrese un correo válido.");
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      isVerified
    });

    const Usuario = { email, name, password }
    let correo = "register";

    await this.envioEmail(Usuario, email, correo);

    return {
      message: "Usuario registrado correctamente.",
    };
  }

  async updateVerificacion(email: string, isVerified: boolean) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Usuario no existe");
    }

    await this.usersService.updateVerifi(email, isVerified);

    const payload = { email: user.email, name: user.name };

    const token = await this.jwtService.signAsync(payload);

    return {
      token: token,
      name: user.name,
      email: user.email,
    };

  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Correo inválido");
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Contraseña inválido");
    }

    if (user.isVerified == false) {
      throw new UnauthorizedException("Su cuenta no está verificada");
    }

    const payload = { email: user.email, name: user.name };

    const token = await this.jwtService.signAsync(payload);

    return {
      token: token,
      name: user.name,
      email: user.email
    };
  }

  async registerEmail({ email }: EmailDto) {

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException("Correo electrónico no existe.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

    if (!emailRegex.test(email)) {
      throw new BadRequestException("Ingrese un correo válido.");
    }

    let correo = "verificacion";

    await this.envioEmail(user, email, correo);

    return { message: "Correo electrónico enviado." };

  }

  async updatePasswordEmail(email: string, passDto: PassEmailDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Usuario no encontrado");
    }

    if (passDto.password !== passDto.verPassword) {
      throw new UnauthorizedException("Las contraseñas no coinciden");
    }

    const hashedNewPassword = await bcryptjs.hash(passDto.password, 10);

    await this.usersService.updatePasswordEmail(email, hashedNewPassword);

    const payload = { email: user.email, name: user.name };

    const token = await this.jwtService.signAsync(payload);

    return {
      tokens: token,
      name: user.name,
      email: user.email,
      message: "Contraseña actualizada correctamente",
    };
  }

  async envioEmail(user: any, email: string, correo: string) {

    const payload = { email: user.email, name: user.name };

    const token = await this.jwtService.signAsync(payload);

    let url: string;
    let filePath: string;

    if (correo == "register") {
      url = `https://briefly1.netlify.app/login?token=${token}`;
      filePath = path.resolve(process.cwd(), 'src/auth/html/plantillaReg.html');
    }

    if (correo == "verificacion") {
      url = `https://briefly1.netlify.app/password?token=${token}`;
      filePath = path.resolve(process.cwd(), 'src/auth/html/plantilla.html');
    }

    const htmlTemplate = fs.readFileSync(filePath, 'utf8');
    const personalizedHtml = htmlTemplate
      .replace('{{name}}', user.name)
      .replace('{{token}}', url);

    await this.mailerService.sendMail({
      to: email,
      subject: "Correo de verificación",
      html: personalizedHtml,
    });

  }

}



