import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { err, ok } from 'neverthrow'

import { PrismaService } from '../prisma/prisma.service'
import { AuthService } from './auth.service'
import { BcryptService } from '../bcrypt/bcrypt.service'
import { beforeEach, describe, expect, it, jest } from 'bun:test'

describe('AuthService', () => {
  let service: AuthService

  const mockPrismaService = {
    user: {
      findUnique: jest.fn((args: { where: { email: string } }) => {
        if (args.where.email === 'alreadyexists@test.com') {
          return {
            id: 1,
            name: 'Already Exists',
            email: 'alreadyexists@test.com',
            password: 'hashed_testpassword123',
          }
        }
        return null
      }),
    },
  }

  const mockBcryptService = {
    compare: jest.fn(
      async (data: string, encrypted: string) => encrypted === `hashed_${data}`,
    ),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        BcryptService,
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(BcryptService)
      .useValue(mockBcryptService)
      .compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('login', () => {
    it('should return an object with a JWT access token if the credentials are valid', async () => {
      expect(
        service.login({
          email: 'alreadyexists@test.com',
          password: 'testpassword123',
        }),
      ).resolves.toEqual(ok({ accessToken: expect.any(String) }))
    })

    it('should return a USER_NOT_FOUND error if there is no user with the provided email', async () => {
      expect(
        service.login({
          email: 'notfound@test.com',
          password: 'testpassword123',
        }),
      ).resolves.toEqual(err('USER_NOT_FOUND'))
    })

    it('should return a WRONG_PASSWORD error if the password is invalid', async () => {
      expect(
        service.login({
          email: 'alreadyexists@test.com',
          password: 'invalidpassword123',
        }),
      ).resolves.toEqual(err('WRONG_PASSWORD'))
    })
  })
})
