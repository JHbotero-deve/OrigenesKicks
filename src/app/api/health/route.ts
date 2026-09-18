import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'UP',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'DOWN',
      database: 'Error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
