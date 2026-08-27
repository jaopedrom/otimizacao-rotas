import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaOptions: any = {
    log: ['query'],
};

if (process.env.DATABASE_URL) {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL
    });
    prismaOptions.adapter = adapter;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


