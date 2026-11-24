import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { afterEach, beforeEach, describe, jest } from 'bun:test';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn((_args: any) => null),
      create: jest.fn((args: any) => {
        return {
          id: 1,
          name: args.data.name,
          email: args.data.email,
          password: args.data.password,
        }
      })
    }
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ZodValidationPipe())
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  })
})
