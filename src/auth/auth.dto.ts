import { createZodDto } from 'nestjs-zod'
import { zJwtResponse, zLoginData } from 'tasknest-schemas';

export class LoginDto extends createZodDto(zLoginData) { }
export class JwtResponseDto extends createZodDto(zJwtResponse) { }
