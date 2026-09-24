import { NextResponse } from 'next/server';
import { getPublicOrderStatus } from '@/lib/actions/public';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const orderCode = typeof body?.orderCode === 'string' ? body.orderCode.trim() : '';

  if (!orderCode) {
    return NextResponse.json(
      { success: false, message: 'Código de pedido inválido.' },
      { status: 400 },
    );
  }

  const result = await getPublicOrderStatus(orderCode);

  return NextResponse.json(result, {
    status: result.success ? 200 : 404,
  });
}
