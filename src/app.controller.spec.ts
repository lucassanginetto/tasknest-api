import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { beforeEach, describe, expect, it, jest } from 'bun:test'
import { PrismaService } from './prisma/prisma.service'
import { ServiceUnavailableException } from '@nestjs/common'

describe('AppController', () => {
  let appController: AppController

  const mockPrismaService = {
    isConnectionOk: jest.fn(async () => true),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile()

    appController = app.get<AppController>(AppController)
  })

  describe('health', () => {
    it('should return status UP if database connection is working', () => {
      expect(appController.health()).resolves.toEqual({
        status: 'UP',
        timestamp: expect.any(String),
        details: {
          database: expect.any(String),
        },
      })
    })

    it('should throw ServiceUnavailable exception if database connection is not working', () => {
      mockPrismaService.isConnectionOk.mockResolvedValue(false)
      expect(appController.health()).rejects.toThrow(
        ServiceUnavailableException,
      )
    })
  })
})
