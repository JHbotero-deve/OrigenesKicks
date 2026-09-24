import crypto from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { confirmOrderAsSale } from "@/lib/order-confirmation";

type WompiEvent = {
  event?: string;
  data?: { transaction?: { id?: string; status?: string; amountInCents?: number; reference?: string } };
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
};

function getPathValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

function checksumForEvent(body: WompiEvent, secret: string) {
  const properties = body.signature?.properties ?? [];
  const values = properties.map((property) => String(getPathValue(body.data, property) ?? ""));
  return crypto.createHash("sha256").update(values.join("") + String(body.timestamp ?? "") + secret, "utf8").digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook Wompi no configurado." }, { status: 503 });

  let body: WompiEvent;
  try {
    body = (await request.json()) as WompiEvent;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (body.event !== "transaction.updated" || !body.data?.transaction) {
    return NextResponse.json({ received: true });
  }

  const expected = checksumForEvent(body, secret);
  const provided = request.headers.get("X-Event-Checksum") || body.signature?.checksum || "";
  if (!provided || !safeEqual(expected, provided)) {
    return NextResponse.json({ error: "Firma de evento inválida." }, { status: 401 });
  }

  const transaction = body.data.transaction;
  const reference = transaction.reference;
  const status = transaction.status;
  const amountInCents = Number(transaction.amountInCents);

  if (!reference || !status || !Number.isSafeInteger(amountInCents)) {
    return NextResponse.json({ error: "Evento incompleto." }, { status: 400 });
  }

  const order = await prisma.pedido.findUnique({
    where: { paymentReference: reference },
    select: { id: true, totalAmount: true, paymentProvider: true },
  });

  if (!order || order.paymentProvider !== "WOMPI") {
    return NextResponse.json({ received: true });
  }

  const expectedAmount = Math.round(Number(order.totalAmount) * 100);
  if (expectedAmount !== amountInCents) {
    return NextResponse.json({ error: "Monto de transacción no coincide." }, { status: 409 });
  }

  const allowed = new Set(["PENDING", "APPROVED", "DECLINED", "ERROR", "VOIDED"]);
  if (!allowed.has(status)) return NextResponse.json({ received: true });

  try {
    if (status === "APPROVED") {
      await prisma.$transaction(async (tx) => {
        await tx.pedido.update({
          where: { id: order.id },
          data: {
            paymentStatus: "APPROVED",
            paymentTransactionId: transaction.id || null,
          },
        });
        await confirmOrderAsSale(tx, order.id, null);
      });
    } else {
      await prisma.pedido.updateMany({
        where: {
          id: order.id,
          paymentStatus: { not: "APPROVED" },
        },
        data: {
          paymentStatus: status,
          paymentTransactionId: transaction.id || null,
        },
      });
    }
  } catch (error) {
    console.error("Error procesando confirmación Wompi:", error);
    return NextResponse.json({ error: "No se pudo registrar el pago." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
