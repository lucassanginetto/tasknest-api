import { createZodDto } from 'nestjs-zod'
import {
  zUserCreationData,
  zUserResponse,
  zUserUpdateData,
} from 'tasknest-schemas'

export class CreateUserDto extends createZodDto(zUserCreationData) {}
export class UpdateUserDto extends createZodDto(zUserUpdateData) {}
export class UserResponseDto extends createZodDto(zUserResponse) {}
