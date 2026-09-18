/**
 * GESTOR DE PAGOS SIMPLIFICADO
 * Este módulo actúa como el puente entre el carrito y la pasarela (Wompi/Manual)
 */

export type PaymentMethod = 'WomPI' | 'MANUAL' | 'CONTRA_ENTREGA';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  currency: string;
}

export async function handlePaymentInitiation(request: PaymentRequest) {
  if (request.method === 'MANUAL' || request.method === 'CONTRA_ENTREGA') {
    return {
      success: true,
      message: 'Pago registrado como manual/pendiente.',
      redirectUrl: null
    };
  }

  if (request.method === 'WomPI') {
    // Aquí irá la integración con el SDK de Wompi
    // Por ahora simulamos la redirección al checkout
    return {
      success: true,
      message: 'Redirigiendo a pasarela de pago...',
      redirectUrl: 'https://checkout.wompi.co/simulated-payment' 
    };
  }

  throw new Error('Método de pago no soportado');
}
