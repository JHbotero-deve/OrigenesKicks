"use server";

type OrderEmailItem = { name: string; size: string; color?: string; quantity: number; price?: number };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] || char);
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAIL_FROM?.trim();

  if (!apiKey || !from) {
    console.warn("[MAIL] RESEND_API_KEY o MAIL_FROM no configurados.");
    return { success: false, error: "EMAIL_NOT_CONFIGURED" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[MAIL] Resend:", response.status, detail);
    return { success: false, error: "EMAIL_SEND_FAILED" };
  }

  return { success: true };
}

export async function sendOrderEmail(to: string, orderId: string, total: number, items: OrderEmailItem[]) {
  const itemsHtml = items.map((item) => `<li>${escapeHtml(item.name)} · Talla ${escapeHtml(item.size)} · Cant. ${item.quantity}</li>`).join("");
  return sendEmail(
    to,
    `Orígenes Kicks · Pedido #${orderId.slice(0, 8)}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h1>Orígenes Kicks</h1><p>Tu reserva fue registrada correctamente.</p><p><strong>Pedido:</strong> #${orderId.slice(0, 8)}</p><ul>${itemsHtml}</ul><p><strong>Total:</strong> $${total.toLocaleString("es-CO")}</p><p>Tienes 24 horas para confirmar el pago.</p></div>`,
  );
}

export async function sendInvoiceEmail(to: string, invoiceNumber: string, pdfUrl: string) {
  return sendEmail(
    to,
    `Orígenes Kicks · Factura ${invoiceNumber}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h1>Factura ${escapeHtml(invoiceNumber)}</h1><p>Tu factura está disponible.</p><p><a href="${encodeURI(pdfUrl)}">Ver factura</a></p></div>`,
  );
}
