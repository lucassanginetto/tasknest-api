import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { beforeEach, describe, expect, it, jest } from 'bun:test'
import { CreateUserDto } from './users.dto'
import { err, ok } from 'neverthrow'
import { ConflictException } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'

describe('UsersController', () => {
  let controller: UsersController

  const mockUsersService = {
    create: jest.fn((dto: CreateUserDto) => {
      if (dto.email === 'alreadyexists@test.com') {
        return err('EMAIL_CONFLICT')
      }
      return ok({
        id: 1,
        name: dto.name,
        email: dto.email,
      })
    }),
  }
  const mockAuthGuard = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile()

    controller = module.get<UsersController>(UsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create user using service', async () => {
      const dto: CreateUserDto = {
        name: 'Test',
        email: 'user@test.com',
        password: 'testpassword123',
      }

      expect(controller.create(dto)).resolves.toEqual({
        id: expect.any(Number),
        name: 'Test',
        email: 'user@test.com',
      })

      expect(mockUsersService.create).toHaveBeenCalledWith(dto)
    })

    it('should throw ConflictException if service returns EMAIL_CONFLICT', async () => {
      const dto: CreateUserDto = {
        name: 'Test',
        email: 'alreadyexists@test.com',
        password: 'testpassword123',
      }

      expect(controller.create(dto)).rejects.toThrow(ConflictException)

      expect(mockUsersService.create).toHaveBeenCalledWith(dto)
    })
  })
})
