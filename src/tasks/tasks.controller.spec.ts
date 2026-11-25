import { Test, TestingModule } from '@nestjs/testing'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { AuthGuard } from '../auth/auth.guard'
import { beforeEach, describe, expect, it, jest } from 'bun:test'
import { CreateTaskDto } from './tasks.dto'
import { FastifyReply as Reply } from 'fastify'

describe('TasksController', () => {
  let controller: TasksController

  const mockTasksService = {
    create: jest.fn((userId: number, dto: CreateTaskDto) => {
      const now = new Date()
      return {
        status: dto.status,
        title: dto.title,
        description: dto.description,
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
      }
    }),
  }
  const mockAuthGuard = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    })
      .overrideProvider(TasksService)
      .useValue(mockTasksService)
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile()

    controller = module.get<TasksController>(TasksController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create task using service ', async () => {
      const dto: CreateTaskDto = {
        title: 'Test',
        description: '',
        status: 'TODO',
      }
      const userId = 1

      let headerKey = ''
      let headerValue = ''

      const result = await controller.create(
        dto,
        {
          sub: userId,
          name: 'Test User',
          email: 'user@test.com',
          iat: 111111,
          exp: 222222,
        },
        {
          header: (key, value) => {
            headerKey = key
            headerValue = value
            return {} as Reply
          },
        } as Reply,
      )
      expect(result).toEqual({
        status: dto.status,
        title: dto.title,
        description: dto.description,
        id: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        userId,
      })

      expect(result.createdAt).toEqual(result.updatedAt)

      expect(headerKey).toBe('Location')
      expect(headerValue).toStartWith('/tasks/')
      expect(headerValue).toEndWith(`${result.id}`)

      expect(mockTasksService.create).toHaveBeenCalledWith(1, dto)
    })
  })
})
