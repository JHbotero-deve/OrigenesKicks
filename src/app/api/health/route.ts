import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'UP',
        database: 'Connected',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      {
        status: 'DOWN',
        database: 'Error',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
