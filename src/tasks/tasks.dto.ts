import { createZodDto } from 'nestjs-zod'
import {
  zTaskCreationData,
  zTaskResponse,
  zTaskUpdateData,
} from 'tasknest-schemas'

export class CreateTaskDto extends createZodDto(zTaskCreationData) {}
export class UpdateTaskDto extends createZodDto(zTaskUpdateData) {}
export class TaskResponseDto extends createZodDto(zTaskResponse) {}
