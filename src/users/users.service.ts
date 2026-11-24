import { Injectable } from '@nestjs/common'
import { err, ok } from 'neverthrow'

import { CreateUserDto, UpdateUserDto } from './users.dto'
import { BcryptService } from '../bcrypt/bcrypt.service'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private bcryptService: BcryptService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (
      (await this.prismaService.user.findUnique({
        where: { email: createUserDto.email },
      })) !== null
    ) {
      return err('EMAIL_CONFLICT')
    }

    const hashedPassword = await this.bcryptService.hash(createUserDto.password)

    const user = await this.prismaService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      },
    })

    return ok({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return ok(
        await this.prismaService.user.update({
          where: { id },
          data: {
            name: updateUserDto.name,
            email: updateUserDto.email,
            password: updateUserDto.password
              ? await this.bcryptService.hash(updateUserDto.password)
              : undefined,
          },
        }),
      )
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return err({ kind: 'USER_NOT_FOUND' } as const)
      } else {
        return err({ kind: 'UNKNOWN_ERROR', cause: error } as const)
      }
    }
  }

  async remove(id: number) {
    try {
      return ok(await this.prismaService.user.delete({ where: { id } }))
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return err({ kind: 'USER_NOT_FOUND' } as const)
      } else {
        return err({ kind: 'UNKNOWN_ERROR', cause: error } as const)
      }
    }
  }
}
