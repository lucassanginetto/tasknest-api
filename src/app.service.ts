import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import z from 'zod';

export const zHealth = z.object({
  timestamp: z.iso.datetime(),
  status: z.union([z.literal('UP'), z.literal('DOWN')]),
  details: z.object({
    database: z.string()
  })
})

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) { }

  async health() {
    return await this.prismaService.isConnectionOk()
      ? {
        timestamp: (new Date()).toISOString(),
        status: 'UP' as const,
        details: {
          database: "Connected and operational"
        }
      }
      : {
        timestamp: (new Date()).toISOString(),
        status: 'DOWN' as const,
        details: {
          database: "Connection failed"
        }
      }
  }
}
