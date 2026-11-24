import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common'

import { AuthService } from './auth.service'
import { ZodResponse } from 'nestjs-zod'
import { JwtResponseDto, LoginDto } from './auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ZodResponse({ type: JwtResponseDto })
  async login(@Body() loginDto: LoginDto) {
    const loginResult = await this.authService.login(loginDto)

    if (loginResult.isErr()) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return loginResult.value
  }
}
