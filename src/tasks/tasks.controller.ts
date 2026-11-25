import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
  ParseEnumPipe,
  ParseIntPipe,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { TasksService } from './tasks.service'
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { AuthGuard, JwtPayload } from '../auth/auth.guard'
import type { FastifyReply as Reply } from 'fastify'
import { Status } from '../prisma/generated/enums'
import { CreateTaskDto, TaskResponseDto, UpdateTaskDto } from './tasks.dto'
import { ZodResponse } from 'nestjs-zod'

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ZodResponse({ type: TaskResponseDto })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @JwtPayload() jwtPayload: JwtPayload,
    @Res({ passthrough: true }) reply: Reply,
  ) {
    const task = await this.tasksService.create(jwtPayload.sub, createTaskDto)
    reply.header('Location', `/tasks/${task.id}`)
    return task
  }

  @ApiBearerAuth()
  @ApiQuery({ name: 'status', enum: Status, required: false })
  @UseGuards(AuthGuard)
  @Get()
  @ZodResponse({ type: [TaskResponseDto] })
  findAll(
    @Query('status', new ParseEnumPipe(Status, { optional: true }))
    status: Status | undefined,
    @JwtPayload() jwtPayload: JwtPayload,
  ) {
    if (status !== undefined) {
      return this.tasksService.findByStatus(jwtPayload.sub, status)
    }
    return this.tasksService.findAll(jwtPayload.sub)
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ZodResponse({ type: TaskResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @JwtPayload() jwtPayload: JwtPayload,
  ) {
    const task = await this.tasksService.findOne(jwtPayload.sub, id)
    if (task === null) throw new NotFoundException('Task not found')
    return task
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  @ZodResponse({ type: TaskResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @JwtPayload() jwtPayload: JwtPayload,
  ) {
    return (
      await this.tasksService.update(jwtPayload.sub, id, updateTaskDto)
    ).match(
      (task) => task,
      (error) => {
        switch (error.kind) {
          case 'TASK_NOT_FOUND':
            throw new NotFoundException('Task not found')
          case 'UNKNOWN_ERROR':
            console.error(error.cause)
            throw new InternalServerErrorException()
        }
      },
    )
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @JwtPayload() jwtPayload: JwtPayload,
  ) {
    const removeResult = await this.tasksService.remove(jwtPayload.sub, id)
    if (removeResult.isErr()) {
      switch (removeResult.error.kind) {
        case 'TASK_NOT_FOUND':
          throw new NotFoundException('Task not found')
        case 'UNKNOWN_ERROR':
          console.error(removeResult.error.cause)
          throw new InternalServerErrorException()
      }
    }
  }
}
