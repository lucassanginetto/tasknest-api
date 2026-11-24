import { Controller, Post, Body, Patch, Param, Delete, ConflictException, UseGuards, HttpCode, HttpStatus, ParseIntPipe, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './users.dto';
import { ZodResponse } from 'nestjs-zod';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard, JwtPayload } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ZodResponse({ type: UserResponseDto })
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto)

    if (result.isErr()) {
      throw new ConflictException('An account with this email address already exists.')
    }

    return result.value;
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  @ZodResponse({ type: UserResponseDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @JwtPayload() jwtPayload: JwtPayload) {
    if (id !== jwtPayload.sub) throw new ForbiddenException("You don't have permission to update other users")
    return (await this.usersService.update(jwtPayload.sub, updateUserDto)).match(
      (user) => user,
      (error) => {
        switch (error.kind) {
          case 'USER_NOT_FOUND':
            throw new NotFoundException('User not found')
          case 'UNKNOWN_ERROR':
            console.error(error.cause)
            throw new InternalServerErrorException()
      }
    })
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number, @JwtPayload() jwtPayload: JwtPayload) {
    if (id !== jwtPayload.sub) throw new ForbiddenException("You don't have permission to delete other users")
    const result = await this.usersService.remove(jwtPayload.sub)
    if (result.isErr()) {
      switch (result.error.kind) {
        case 'USER_NOT_FOUND':
          throw new NotFoundException('User not found')
        case 'UNKNOWN_ERROR':
          throw new InternalServerErrorException()
      }
    }
  }
}
