export type PaymentMethod = "WomPI" | "MANUAL" | "CONTRA_ENTREGA";

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  currency: string;
}

export async function handlePaymentInitiation(request: PaymentRequest) {
  if (!request.orderId || !Number.isFinite(request.amount) || request.amount <= 0) {
    return { success: false, message: "Datos de pago inválidos.", redirectUrl: null };
  }

  if (request.currency !== "COP") {
    return { success: false, message: "Moneda no soportada.", redirectUrl: null };
  }

  if (request.method === "MANUAL" || request.method === "CONTRA_ENTREGA") {
    return {
      success: true,
      message: "Pedido registrado como pago pendiente de confirmación.",
      redirectUrl: null,
    };
  }

  if (request.method === "WomPI") {
    return {
      success: false,
      message: "El pago en línea todavía no está habilitado.",
      redirectUrl: null,
    };
  }

  return { success: false, message: "Método de pago no soportado.", redirectUrl: null };
}
