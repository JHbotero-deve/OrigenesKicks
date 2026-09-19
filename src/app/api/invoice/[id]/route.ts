import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth-guard';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    return new NextResponse('No autorizado', { status: 401 });
  }

  const factura = await prisma.factura.findUnique({
    where: { id },
    include: {
      items: true,
      pedido: { include: { store: true } },
    },
  });

  if (!factura) {
    return new NextResponse('Factura no encontrada', { status: 404 });
  }

  const isPrivileged = auth.dbUser.role === 'OWNER' || auth.dbUser.role === 'ADMIN';
  if (!isPrivileged && factura.pedido.clientId !== auth.dbUser.id) {
    return new NextResponse('No autorizado', { status: 403 });
  }

  const store = factura.pedido.store;
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Factura ${escapeHtml(factura.fullNumber)}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: 900; font-style: italic; text-transform: uppercase; }
          .info { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          table { width: 100%; border-collapse: collapse; margin-top: 40px; }
          th { background: #f4f4f4; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; }
          td { padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; }
          .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
          .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">ORÍGENES KICKS</div>
            <div style="font-size: 12px;">${escapeHtml(store?.name || 'Administración Central')}</div>
            <div style="font-size: 10px;">${escapeHtml(store?.address || '')} - ${escapeHtml(store?.city || '')}</div>
            <div style="font-size: 10px;">WhatsApp: ${escapeHtml(store?.phone || '')}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold;">RECIBO OFICIAL DE VENTA</div>
            <div style="font-size: 20px; color: #f97316;">${escapeHtml(factura.fullNumber)}</div>
            <div style="font-size: 10px;">Fecha de compra: ${escapeHtml(new Date(factura.issueDate).toLocaleDateString('es-CO'))}</div>
          </div>
        </div>

        <div class="info">
          <div>
            <div style="font-size: 10px; font-weight: bold; color: #aaa;">CLIENTE</div>
            <div style="font-weight: bold;">${escapeHtml(factura.customerName)}</div>
            <div style="font-size: 11px;">${escapeHtml(factura.customerEmail || '')}</div>
            <div style="font-size: 11px;">CC/NIT: ${escapeHtml(factura.customerId)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; font-weight: bold; color: #aaa;">MÉTODO DE PAGO</div>
            <div style="font-weight: bold;">${escapeHtml(factura.paymentMethod)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Talla</th>
              <th>Cant.</th>
              <th>P. Unitario</th>
              <th>IVA</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${factura.items.map(item => `
              <tr>
                <td>${escapeHtml(item.productName)}</td>
                <td>${escapeHtml(item.size || '-')}</td>
                <td>${item.quantity}</td>
                <td>$${Number(item.unitPrice).toLocaleString('es-CO')}</td>
                <td>$${Number(item.taxAmount).toLocaleString('es-CO')}</td>
                <td>$${Number(item.lineTotal).toLocaleString('es-CO')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          <div style="font-size: 12px; font-weight: normal;">Precio sin IVA: $${Number(factura.subtotal).toLocaleString('es-CO')}</div>
          <div style="font-size: 12px; font-weight: normal;">IVA: $${Number(factura.taxAmount).toLocaleString('es-CO')}</div>
          <div style="margin-top: 10px; font-size: 20px;">TOTAL PAGADO: $${Number(factura.totalAmount).toLocaleString('es-CO')}</div>
        </div>

        <div class="footer">
          <p>Este documento es un soporte de tu compra en Orígenes Kicks.</p>
          <p>Gracias por apoyar la industria nacional y el talento del barrio.</p>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}
