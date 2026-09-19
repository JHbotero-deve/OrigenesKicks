import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/actions/orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = typeof body?.orderId === 'string' ? body.orderId : '';
    const status = typeof body?.status === 'string' ? body.status : '';

    const result = await updateOrderStatus(
      orderId,
      status as Parameters<typeof updateOrderStatus>[1]
    );

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Solicitud inválida' },
      { status: 400 }
    );
  }
}
