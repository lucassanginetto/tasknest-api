import { Test, TestingModule } from '@nestjs/testing'
import { err, ok } from 'neverthrow'
import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthGuard } from './auth.guard'
import { UnauthorizedException } from '@nestjs/common'
import { LoginDto } from './auth.dto'

describe('AuthController', () => {
  let controller: AuthController

  const mockAuthService = {
    login: mock((dto: LoginDto) => {
      if (dto.email !== 'user@test.com') {
        return err('USER_NOT_FOUND')
      }
      if (dto.password !== 'testpassword123') {
        return err('WRONG_PASSWORD')
      }
      return ok({
        accessToken: 'jwt.access.token',
      })
    }),
  }
  const mockAuthGuard = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('login', () => {
    it('should login user using service', async () => {
      const dto: LoginDto = {
        email: 'user@test.com',
        password: 'testpassword123',
      }

      expect(controller.login(dto)).resolves.toEqual({
        accessToken: expect.any(String),
      })

      expect(mockAuthService.login).toHaveBeenCalledWith(dto)
    })

    it('should throw UnauthorizedException if email is invalid', async () => {
      const dto: LoginDto = {
        email: 'notuser@test.com',
        password: 'testpassword123',
      }

      expect(controller.login(dto)).rejects.toThrow(UnauthorizedException)

      expect(mockAuthService.login).toHaveBeenCalledWith(dto)
    })

    it('should throw UnauthorizedException if password is invalid', async () => {
      const dto: LoginDto = {
        email: 'user@test.com',
        password: 'wrongpassword123',
      }

      expect(controller.login(dto)).rejects.toThrow(UnauthorizedException)

      expect(mockAuthService.login).toHaveBeenCalledWith(dto)
    })
  })
})
