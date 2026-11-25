import { Test, TestingModule } from '@nestjs/testing'
import { BcryptService } from './bcrypt.service'
import { beforeEach, describe, expect, it } from 'bun:test'

describe('BcryptService', () => {
  let service: BcryptService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile()

    service = module.get<BcryptService>(BcryptService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should hash and compare strings', async () => {
    const hashed_string = await service.hash('string')
    expect(service.compare('string', hashed_string)).resolves.toBe(true)
    expect(service.compare('otherstring', hashed_string)).resolves.toBe(false)
  })
})
