import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";
import { Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "./guard/auth.guard";
import { EmailDto, PassDto, PassEmailDto } from "./dto/pass.dto";

@ApiTags('Auth')
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,) { }

  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("email")
  emailRegister(@Body() email: EmailDto) {
    return this.authService.registerEmail(email);
  }

  @Patch('update-password-email')
  @UseGuards(AuthGuard)
  updatePasswordEmail(@Request() req, @Body() passDto: PassEmailDto) {
    return this.authService.updatePasswordEmail(req.user.email, passDto);
  }

  @Patch('tokens-verifi')
  @UseGuards(AuthGuard)
  updateVerification(@Request() req, @Body() isVerified:boolean) {
    return this.authService.updateVerificacion(req.user.email, isVerified);
  }

}



