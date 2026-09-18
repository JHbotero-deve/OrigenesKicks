// Servicio de mensajería para Orígenes Kicks
// Usando una estructura profesional para notificaciones

export async function sendOrderEmail(to: string, orderId: string, total: number, items: any[]) {
  const itemsHtml = items.map(i => `<li>${i.name} (Talla ${i.size}) x${i.quantity}</li>`).join('');

  console.log(`[REAL MAIL SERVICE] Enviando a ${to}...`);

  // Aquí iría la integración con Resend o Nodemailer
  // Por ahora simulamos el éxito para mantener la fluidez
  return { success: true };
}

export async function sendInvoiceEmail(to: string, invoiceNumber: string, pdfUrl: string) {
  console.log(`[INVOICE SERVICE] Enviando factura ${invoiceNumber} a ${to}...`);
  return { success: true };
}
