import { createZodDto } from 'nestjs-zod'
import { zJwtResponse, zLoginData, zSignupData, zUserResponse } from 'tasknest-schemas';

export class LoginDto extends createZodDto(zLoginData) { }
export class SignupDto extends createZodDto(zSignupData) { }
export class UserResponseDto extends createZodDto(zUserResponse) { }
export class JwtResponseDto extends createZodDto(zJwtResponse) { }
