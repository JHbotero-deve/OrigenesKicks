"use server";

import crypto from "node:crypto";
import prisma from "./db";
import { requireAuthenticatedUser } from "./auth-guard";

const WOMPI_CHECKOUT_URL = process.env.WOMPI_CHECKOUT_URL || "https://checkout.wompi.co/p/";
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://origenes-kicks.vercel.app";

export type PaymentMethod = "WOMPI" | "TRANSFERENCIA" | "CONTRA_ENTREGA_MEDELLIN" | "EFECTIVO";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

export async function initiateWompiCheckout(pedidoId: string, trackingCode?: string) {
  const auth = await requireAuthenticatedUser();

  if (!WOMPI_PUBLIC_KEY || !WOMPI_INTEGRITY_SECRET) {
    console.error("Wompi no está configurado: faltan WOMPI_PUBLIC_KEY o WOMPI_INTEGRITY_SECRET.");
    return { success: false, error: "El pago en línea no está disponible temporalmente." };
  }

  const order = await prisma.pedido.findFirst({
    where: {
      id: pedidoId,
      ...(auth.ok
        ? {}
        : { trackingCode: trackingCode?.trim().toUpperCase() || "__INVALID__" }),
    },
    select: {
      id: true,
      trackingCode: true,
      clientId: true,
      totalAmount: true,
      paymentMethod: true,
      paymentReference: true,
      paymentStatus: true,
      customerEmail: true,
      customerName: true,
      client: { select: { email: true, name: true } },
      envio: { select: { address: true, city: true, phone: true } },
    },
  });

  if (!order) return { success: false, error: "Pedido no encontrado." };
  if (auth.ok && order.clientId !== auth.dbUser.id) {
    return { success: false, error: "Pedido no encontrado." };
  }

  if (order.paymentMethod !== "WOMPI") {
    return { success: false, error: "El pedido no usa Wompi." };
  }

  if (order.paymentStatus === "APPROVED") {
    return { success: false, error: "Este pedido ya tiene un pago aprobado." };
  }

  const reference = order.paymentReference;
  if (!reference) {
    return { success: false, error: "El pedido no tiene referencia de pago." };
  }

  const amountInCents = Math.round(Number(order.totalAmount) * 100);
  if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
    return { success: false, error: "El valor del pedido no es válido para Wompi." };
  }

  const signature = sha256(reference + amountInCents + "COP" + WOMPI_INTEGRITY_SECRET);
  const params = new URLSearchParams({
    "public-key": WOMPI_PUBLIC_KEY,
    currency: "COP",
    "amount-in-cents": String(amountInCents),
    reference,
    "signature:integrity": signature,
    "redirect-url": APP_URL + "/payment/result?tracking=" + encodeURIComponent(order.trackingCode),
    "customer-data:email": order.customerEmail || order.client.email,
    "customer-data:full-name": order.customerName || order.client.name || "Cliente Orígenes Kicks",
  });

  if (order.envio?.phone) params.set("customer-data:phone-number", order.envio.phone);
  params.set("customer-data:phone-number-prefix", "+57");
  if (order.envio?.address) params.set("shipping-address:address-line-1", order.envio.address);
  if (order.envio?.city) {
    params.set("shipping-address:city", order.envio.city);
    params.set("shipping-address:region", "Antioquia");
  }
  if (order.envio?.phone) params.set("shipping-address:phone-number", order.envio.phone);
  params.set("shipping-address:country", "CO");

  return { success: true, checkoutUrl: WOMPI_CHECKOUT_URL + "?" + params.toString(), reference };
}

export async function handlePaymentInitiation(request: {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  currency: string;
}) {
  if (!request.orderId || !Number.isFinite(request.amount) || request.amount <= 0 || request.currency !== "COP") {
    return { success: false, message: "Datos de pago inválidos.", redirectUrl: null };
  }

  if (request.method === "TRANSFERENCIA" || request.method === "CONTRA_ENTREGA_MEDELLIN" || request.method === "EFECTIVO") {
    return { success: true, message: "Pedido registrado como pago pendiente de confirmación.", redirectUrl: null };
  }

  if (request.method === "WOMPI") {
    const result = await initiateWompiCheckout(request.orderId);
    return { success: result.success, message: result.error || "Redirigiendo a Wompi.", redirectUrl: result.checkoutUrl || null };
  }

  return { success: false, message: "Método de pago no soportado.", redirectUrl: null };
}
