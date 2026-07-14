import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
let isDbHealthy = false;

function isValidPostgresUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.startsWith('postgresql://') || url.startsWith('postgres://');
}

export function getPrisma(): PrismaClient {
  if (!prisma) {
    const dbUrl = isValidPostgresUrl(process.env.DATABASE_URL)
      ? process.env.DATABASE_URL!
      : 'postgresql://postgres:postgres@localhost:5432/chainshield';
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    });
  }
  return prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !isValidPostgresUrl(dbUrl)) {
    isDbHealthy = false;
    return false;
  }
  try {
    const client = getPrisma();
    // Simple verification query
    await client.$queryRaw`SELECT 1`;
    isDbHealthy = true;
    return true;
  } catch (err: any) {
    console.warn('⚠️ Database connection verification failed:', err.message);
    isDbHealthy = false;
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isDbHealthy;
}
