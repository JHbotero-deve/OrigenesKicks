import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const factura = await prisma.factura.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      pedido: { include: { store: true } }
    }
  });

  if (!factura) return new NextResponse("Factura no encontrada", { status: 404 });

  const store = factura.pedido.store;

  // Generamos un HTML profesional de factura
  const html = `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: 900; font-style: italic; text-transform: uppercase; }
          .info { margin-top: 20px; display: grid; grid-template-cols: 1fr 1fr; gap: 40px; }
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
            <div style="font-size: 12px;">${store?.name || 'Administración Central'}</div>
            <div style="font-size: 10px;">${store?.address || ''} - ${store?.city || ''}</div>
            <div style="font-size: 10px;">WhatsApp: ${store?.phone || ''}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold;">RECIBO OFICIAL DE VENTA</div>
            <div style="font-size: 20px; color: #f97316;">${factura.fullNumber}</div>
            <div style="font-size: 10px;">Fecha de compra: ${new Date(factura.issueDate).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="info">
          <div>
            <div style="font-size: 10px; font-weight: bold; color: #aaa;">CLIENTE</div>
            <div style="font-weight: bold;">${factura.customerName}</div>
            <div style="font-size: 11px;">${factura.customerEmail || ''}</div>
            <div style="font-size: 11px;">CC/NIT: ${factura.customerId}</div>
          </div>
          <div style="text-align: right;">
             <div style="font-size: 10px; font-weight: bold; color: #aaa;">MÉTODO DE PAGO</div>
             <div style="font-weight: bold;">${factura.paymentMethod}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Talla</th>
              <th>Cant.</th>
              <th>P. Unitario</th>
              <th>IVA (19%)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${factura.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.size || '-'}</td>
                <td>${item.quantity}</td>
                <td>$${Number(item.unitPrice).toLocaleString()}</td>
                <td>$${Number(item.taxAmount).toLocaleString()}</td>
                <td>$${Number(item.lineTotal).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          <div style="font-size: 12px; font-weight: normal;">Precio sin IVA: $${Number(factura.subtotal).toLocaleString()}</div>
          <div style="font-size: 12px; font-weight: normal;">IVA (19%): $${Number(factura.taxAmount).toLocaleString()}</div>
          <div style="margin-top: 10px; font-size: 20px;">TOTAL PAGADO: $${Number(factura.totalAmount).toLocaleString()}</div>
        </div>

        <div class="footer">
          <p>Este documento es un soporte de tu compra en Orígenes Kicks.</p>
          <p>¡Gracias por apoyar la industria nacional y el talento del barrio!</p>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
