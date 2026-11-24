import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { err, ok } from 'neverthrow';

import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService, private jwtService: JwtService, private bcryptService: BcryptService) { }

  async login(loginDto: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email }
    })

    if (user === null) {
      return err('USER_NOT_FOUND')
    }

    if (!await this.bcryptService.compare(loginDto.password, user.password)) {
      return err('WRONG_PASSWORD')
    }

    return ok({
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        name: user.name,
        email: user.email,
      })
    })
  }
}
