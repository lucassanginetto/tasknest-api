import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { err, ok } from 'neverthrow';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../bcrypt/bcrypt.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn((args: { where: { email: string } }) => {
        if (args.where.email === 'alreadyexists@test.com') {
          return {
            id: 1,
            name: 'Already Exists',
            email: 'alreadyexists@test.com',
            password: 'hashed_testpassword123'
          }
        }
        return null
      }),
      create: jest.fn((args: {
        data: {
          name: string;
          email: string;
          password: string;
        }
      }) => {
        return {
          id: 1,
          ...args.data
        }
      })
    }
  }

  const mockBcryptService = {
    hash: jest.fn(async (data: string) => `hashed_${data}`),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService, BcryptService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(BcryptService)
      .useValue(mockBcryptService)
      .compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user and return their id, name and email', async () => {
      expect(service.create({ name: 'Test', email: 'user@test.com', password: 'testpassword123' }))
        .resolves
        .toEqual(ok({
          id: expect.any(Number),
          name: 'Test',
          email: 'user@test.com'
        }))
    })

    it("should return an EMAIL_CONFLICT error if there's already a user with the provided email", async () => {
      expect(service.create({ name: 'Test', email: 'alreadyexists@test.com', password: 'testpassword123' }))
        .resolves
        .toEqual(err('EMAIL_CONFLICT'))
    })
  })
});
