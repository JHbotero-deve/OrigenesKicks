/**
 * RUTAS DE FACTURACIÓN ELECTRÓNICA (DIAN)
 * 
 * Este módulo maneja la generación de facturas electrónicas
 * compatibles con la normativa colombiana de facturación.
 * 
 * @module routes/invoices
 */

import express from "express";
import crypto from "crypto";
import prisma from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// ALGORITMO DE GENERACIÓN DE CUFE (DIAN)
// ============================================

/**
 * Genera el CUFE (Código Único de Factura Electrónica)
 * según los criterios de la DIAN colombiana.
 * 
 * El CUFE se genera usando SHA-384 sobre la concatenación de:
 * - Número de factura
 * - Fecha de emisión (YYYY-MM-DD)
 * - Hora de emisión (HH:MM:SS)
 * - Nit del vendedor
 * - Nit del comprador
 * - Total de la factura
 * - Total del IVA
 * 
 * @param {Object} params - Parámetros para el CUFE
 * @returns {string} CUFE generado
 */
function generateCUFE(params) {
  const {
    invoiceNumber,
    issueDate,
    nitVendedor,
    nitComprador,
    totalAmount,
    taxAmount
  } = params;

  // Formatear fecha y hora
  const date = new Date(issueDate);
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = date.toISOString().split("T")[1].substring(0, 8); // HH:MM:SS

  // Concatenar datos según especificación DIAN
  const dataToHash = [
    invoiceNumber.toString().padStart(10, "0"),
    dateStr,
    timeStr,
    nitVendedor.replace(/[^0-9]/g, ""), // Solo números
    nitComprador.replace(/[^0-9]/g, ""), // Solo números
    totalAmount.toString().replace(/\./g, "").padStart(16, "0"),
    taxAmount.toString().replace(/\./g, "").padStart(16, "0"),
    "1" // Código numérico (1 = factura de venta)
  ].join("");

  // Generar hash SHA-384
  const hash = crypto.createHash("sha384").update(dataToHash).digest("hex");

  // El CUFE incluye un prefijo de versión + hash
  return `cufe${hash}`;
}

/**
 * Genera los datos para el código QR de validación
 * @param {Object} invoice - Datos de la factura
 * @returns {string} Datos del QR
 */
function generateQRData(invoice) {
  const store = invoice.store || {};
  
  return JSON.stringify({
    nit: store.nit || "",
    invoice: invoice.fullNumber,
    date: new Date(invoice.issueDate).toISOString(),
    total: invoice.totalAmount,
    cufe: invoice.cufe,
    qr: `https://catalogo-vpfe.dian.gov.co/document/search?number=${invoice.fullNumber}`
  });
}

// ============================================
// OBTENER O CREAR CONFIGURACIÓN DE LA TIENDA
// ============================================

async function getOrCreateStoreConfig() {
  let store = await prisma.storeConfig.findFirst();
  
  if (!store) {
    // Crear configuración por defecto
    store = await prisma.storeConfig.create({
      data: {
        businessName: "Orígenes Kicks",
        nit: "1234567890",
        regime: "SIMPLIFICADO",
        address: "Calle Principal #123",
        city: "Bogotá",
        department: "Cundinamarca",
        phone: "3001234567",
        email: "contacto@origeneskicks.com",
        invoicePrefix: "OK",
        defaultTaxRate: 19.0,
        lastInvoiceNumber: 0
      }
    });
  }
  
  return store;
}

// ============================================
// RUTAS PÚBLICAS (solo datos mínimos)
// ============================================

/**
 * GET /api/v1/invoices
 * Lista de facturas (público: solo número y estado)
 */
router.get("/", async (req, res) => {
  try {
    const invoices = await prisma.factura.findMany({
      select: {
        id: true,
        fullNumber: true,
        customerName: true,
        subtotal: true,
        taxAmount: true,
        totalAmount: true,
        status: true,
        issueDate: true
      },
      orderBy: { invoiceNumber: "desc" }
    });

    res.json({
      ok: true,
      data: invoices
    });
  } catch (error) {
    console.error("[INVOICES] Error al listar facturas:", error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener facturas."
    });
  }
});

/**
 * GET /api/v1/invoices/:id
 * Ver detalles de una factura
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.factura.findUnique({
      where: { id },
      include: {
        items: true,
        pedido: {
          select: {
            id: true,
            status: true,
            paymentMethod: true
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        ok: false,
        message: "Factura no encontrada."
      });
    }

    // Ocultar datos sensibles del cliente para usuarios no autenticados
    const isAuthenticated = req.headers.authorization?.startsWith("Bearer ");
    
    const publicInvoice = {
      id: invoice.id,
      fullNumber: invoice.fullNumber,
      issueDate: invoice.issueDate,
      status: invoice.status,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      paymentMethod: invoice.paymentMethod,
      items: invoice.items.map(item => ({
        id: item.id,
        productName: item.productName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        lineTotal: item.lineTotal,
        size: item.size,
        color: item.color
      })),
      // Solo mostrar datos del cliente si está autenticado
      ...(isAuthenticated && {
        customerName: invoice.customerName,
        customerId: invoice.customerId,
        customerIdType: invoice.customerIdType
      })
    };

    res.json({
      ok: true,
      data: publicInvoice
    });
  } catch (error) {
    console.error("[INVOICES] Error al obtener factura:", error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener factura."
    });
  }
});

// ============================================
// RUTAS PROTEGIDAS (ADMIN/SELLER)
// ============================================

/**
 * POST /api/v1/invoices/from-order/:pedidoId
 * Generar factura a partir de un pedido
 */
router.post("/from-order/:pedidoId", authenticate, authorize("ADMIN", "SELLER"), async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const {
      customerIdType = "CC",
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      paymentMethod = "CONTADO",
      notes
    } = req.body;

    // Verificar que el pedido existe
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        },
        envio: true,
        invoice: true
      }
    });

    if (!pedido) {
      return res.status(404).json({
        ok: false,
        message: "Pedido no encontrado."
      });
    }

    // Verificar si ya tiene factura
    if (pedido.invoice) {
      return res.status(400).json({
        ok: false,
        message: "Este pedido ya tiene una factura asociada.",
        data: { invoiceId: pedido.invoice.id }
      });
    }

    // Obtener configuración de la tienda
    const store = await getOrCreateStoreConfig();

    // Incrementar número de factura
    const newInvoiceNumber = store.lastInvoiceNumber + 1;
    const fullNumber = `${store.invoicePrefix}-${newInvoiceNumber.toString().padStart(5, "0")}`;

    // Calcular totales
    let subtotal = 0;
    let totalTax = 0;
    const taxDetails = {};

    const itemsData = pedido.items.map(item => {
      const product = item.variant.product;
      const taxRate = parseFloat(product.taxRate || store.defaultTaxRate);
      const lineSubtotal = parseFloat(item.unitPrice) * item.quantity;
      const lineTax = lineSubtotal * (taxRate / 100);

      subtotal += lineSubtotal;
      totalTax += lineTax;

      // Acumular detalles de impuestos
      if (!taxDetails[taxRate]) {
        taxDetails[taxRate] = { base: 0, amount: 0 };
      }
      taxDetails[taxRate].base += lineSubtotal;
      taxDetails[taxRate].amount += lineTax;

      return {
        productName: product.name,
        productSku: product.sku || item.variant.sku,
        description: product.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: taxRate,
        taxAmount: lineTax,
        lineTotal: lineSubtotal + lineTax,
        size: item.variant.size,
        color: item.variant.color
      };
    });

    const totalAmount = subtotal + totalTax;

    // Datos del cliente
    const invoiceCustomerName = customerName || (pedido.envio ? "Cliente" : "Cliente");
    const invoiceCustomerId = customerId || "N/A";

    // Crear la factura
    const invoice = await prisma.factura.create({
      data: {
        invoiceNumber: newInvoiceNumber,
        prefix: store.invoicePrefix,
        fullNumber,
        
        // Datos del cliente (sensibles)
        customerName: invoiceCustomerName,
        customerIdType,
        customerId: invoiceCustomerId,
        customerEmail: customerEmail || pedido.envio?.phone || null,
        customerPhone: customerPhone || pedido.envio?.phone || null,
        customerAddress: customerAddress || pedido.envio?.address || null,
        
        // Totales
        subtotal,
        taxAmount: totalTax,
        totalAmount,
        taxDetails: JSON.stringify(taxDetails),
        
        // Pago
        paymentMethod,
        
        // Referencia al pedido
        pedidoId: pedido.id,
        
        // Estado
        status: "VALIDADA",
        
        notes
      },
      include: {
        items: true
      }
    });

    // Generar CUFE
    const cufeData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      nitVendedor: store.nit,
      nitComprador: invoice.customerId,
      totalAmount: invoice.totalAmount,
      taxAmount: invoice.taxAmount
    };

    const cufe = generateCUFE(cufeData);
    const qrData = generateQRData({ ...invoice, store, cufe });

    // Actualizar factura con CUFE
    const updatedInvoice = await prisma.factura.update({
      where: { id: invoice.id },
      data: {
        cufe,
        cufeQrCode: qrData
      }
    });

    // Actualizar secuencia en store config
    await prisma.storeConfig.update({
      where: { id: store.id },
      data: { lastInvoiceNumber: newInvoiceNumber }
    });

    res.status(201).json({
      ok: true,
      message: "Factura generada exitosamente.",
      data: {
        id: updatedInvoice.id,
        fullNumber: updatedInvoice.fullNumber,
        cufe: updatedInvoice.cufe,
        subtotal: updatedInvoice.subtotal,
        taxAmount: updatedInvoice.taxAmount,
        totalAmount: updatedInvoice.totalAmount,
        status: updatedInvoice.status,
        issueDate: updatedInvoice.issueDate
      }
    });

  } catch (error) {
    console.error("[INVOICES] Error al crear factura:", error);
    res.status(500).json({
      ok: false,
      message: "Error al generar la factura."
    });
  }
});

/**
 * GET /api/v1/invoices/:id/full
 * Ver factura completa con datos del cliente (solo admin)
 */
router.get("/:id/full", authenticate, authorize("ADMIN", "SELLER"), async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.factura.findUnique({
      where: { id },
      include: {
        items: true,
        pedido: {
          include: {
            client: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        ok: false,
        message: "Factura no encontrada."
      });
    }

    // Obtener datos de la tienda
    const store = await getOrCreateStoreConfig();

    res.json({
      ok: true,
      data: {
        ...invoice,
        store: {
          businessName: store.businessName,
          nit: store.nit,
          address: store.address,
          city: store.city,
          phone: store.phone,
          email: store.email
        }
      }
    });
  } catch (error) {
    console.error("[INVOICES] Error:", error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener factura."
    });
  }
});

/**
 * GET /api/v1/invoices/:id/pdf
 * Generar PDF de la factura
 */
router.get("/:id/pdf", authenticate, authorize("ADMIN", "SELLER"), async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.factura.findUnique({
      where: { id },
      include: {
        items: true,
        pedido: {
          include: {
            client: true,
            envio: true
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        ok: false,
        message: "Factura no encontrada."
      });
    }

    // Obtener datos de la tienda
    const store = await getOrCreateStoreConfig();

    // Generar HTML de la factura para convertir a PDF
    const invoiceHtml = generateInvoiceHTML(invoice, store);

    // En producción, usaríamos un generador de PDF real
    // Por ahora, devolvemos el HTML
    res.json({
      ok: true,
      data: {
        html: invoiceHtml,
        message: "PDF generado (versión HTML)"
      }
    });

  } catch (error) {
    console.error("[INVOICES] Error al generar PDF:", error);
    res.status(500).json({
      ok: false,
      message: "Error al generar PDF."
    });
  }
});

/**
 * POST /api/v1/invoices/:id/annul
 * Anular una factura
 */
router.post("/:id/annul", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const invoice = await prisma.factura.update({
      where: { id },
      data: {
        status: "ANULADA",
        notes: reason ? `ANULADA: ${reason}` : "ANULADA sin motivo especificado"
      }
    });

    res.json({
      ok: true,
      message: "Factura anulada.",
      data: invoice
    });
  } catch (error) {
    console.error("[INVOICES] Error al anular:", error);
    res.status(500).json({
      ok: false,
      message: "Error al anular la factura."
    });
  }
});

// ============================================
// CONFIGURACIÓN DE LA TIENDA
// ============================================

/**
 * GET /api/v1/invoices/config
 * Obtener configuración de facturación
 */
router.get("/config/store", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const store = await getOrCreateStoreConfig();
    
    // No exponer datos sensibles en exceso
    res.json({
      ok: true,
      data: {
        businessName: store.businessName,
        nit: store.nit,
        address: store.address,
        city: store.city,
        phone: store.phone,
        email: store.email,
        invoicePrefix: store.invoicePrefix,
        lastInvoiceNumber: store.lastInvoiceNumber,
        defaultTaxRate: store.defaultTaxRate
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener configuración."
    });
  }
});

/**
 * PUT /api/v1/invoices/config
 * Actualizar configuración de facturación
 */
router.put("/config/store", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const store = await getOrCreateStoreConfig();
    
    const {
      businessName,
      nit,
      address,
      city,
      phone,
      email,
      invoicePrefix,
      defaultTaxRate,
      dianResolution,
      dianFrom,
      dianTo
    } = req.body;

    const updated = await prisma.storeConfig.update({
      where: { id: store.id },
      data: {
        ...(businessName && { businessName }),
        ...(nit && { nit }),
        ...(address && { address }),
        ...(city && { city }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(invoicePrefix && { invoicePrefix }),
        ...(defaultTaxRate && { defaultTaxRate: parseFloat(defaultTaxRate) }),
        ...(dianResolution && { dianResolution }),
        ...(dianFrom && { dianFrom: parseInt(dianFrom) }),
        ...(dianTo && { dianTo: parseInt(dianTo) }),
        ...(dianResolution && { dianDate: new Date() })
      }
    });

    res.json({
      ok: true,
      message: "Configuración actualizada.",
      data: {
        businessName: updated.businessName,
        nit: updated.nit,
        invoicePrefix: updated.invoicePrefix,
        lastInvoiceNumber: updated.lastInvoiceNumber
      }
    });
  } catch (error) {
    console.error("[INVOICES] Error al actualizar config:", error);
    res.status(500).json({
      ok: false,
      message: "Error al actualizar configuración."
    });
  }
});

// ============================================
// HELPERS
// ============================================

/**
 * Genera el HTML de la factura para impresión
 */
function generateInvoiceHTML(invoice, store) {
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP"
    }).format(num);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const itemsHTML = invoice.items.map(item => `
    <tr>
      <td>${item.productName}</td>
      <td>${item.size || "-"}</td>
      <td>${item.color || "-"}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.unitPrice)}</td>
      <td>${item.taxRate}%</td>
      <td>${formatCurrency(item.lineTotal)}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${invoice.fullNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #333; padding: 20px; }
    .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px; }
    .company h1 { color: #1a1a2e; font-size: 24px; }
    .company p { color: #666; margin-top: 5px; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { color: #e94560; font-size: 20px; }
    .invoice-info p { margin-top: 5px; }
    .customer-section { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
    .customer-section h3 { color: #1a1a2e; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #1a1a2e; color: white; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    .totals { text-align: right; margin-top: 20px; }
    .totals p { margin: 5px 0; }
    .totals .total { font-size: 18px; font-weight: bold; color: #e94560; }
    .cufe-section { margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 5px; text-align: center; }
    .cufe { font-family: monospace; font-size: 10px; color: #666; word-break: break-all; }
    .footer { margin-top: 40px; text-align: center; color: #888; font-size: 10px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="company">
        <h1>${store.businessName}</h1>
        <p>NIT: ${store.nit}</p>
        <p>${store.address}</p>
        <p>${store.city}, ${store.department || "Cundinamarca"}</p>
        <p>Tel: ${store.phone || "N/A"}</p>
      </div>
      <div class="invoice-info">
        <h2>FACTURA DE VENTA</h2>
        <p><strong>No. ${invoice.fullNumber}</strong></p>
        <p>Fecha: ${formatDate(invoice.issueDate)}</p>
        <p>Estado: ${invoice.status}</p>
      </div>
    </div>

    <div class="customer-section">
      <h3>CLIENTE</h3>
      <p><strong>Nombre:</strong> ${invoice.customerName}</p>
      <p><strong>${invoice.customerIdType}:</strong> ${invoice.customerId}</p>
      ${invoice.customerAddress ? `<p><strong>Dirección:</strong> ${invoice.customerAddress}</p>` : ""}
      ${invoice.customerEmail ? `<p><strong>Email:</strong> ${invoice.customerEmail}</p>` : ""}
      ${invoice.customerPhone ? `<p><strong>Tel:</strong> ${invoice.customerPhone}</p>` : ""}
    </div>

    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Talla</th>
          <th>Color</th>
          <th>Cant.</th>
          <th>Vr. Unitario</th>
          <th>IVA</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="totals">
      <p>Subtotal: ${formatCurrency(invoice.subtotal)}</p>
      <p>IVA (19%): ${formatCurrency(invoice.taxAmount)}</p>
      <p class="total">TOTAL A PAGAR: ${formatCurrency(invoice.totalAmount)}</p>
    </div>

    ${invoice.cufe ? `
    <div class="cufe-section">
      <p><strong>CUFE:</strong></p>
      <p class="cufe">${invoice.cufe}</p>
      <p style="margin-top: 10px; font-size: 10px;">
        Verifique su factura en: https://catalogo-vpfe.dian.gov.co
      </p>
    </div>
    ` : ""}

    ${invoice.notes ? `<p style="margin-top: 20px;"><strong>Notas:</strong> ${invoice.notes}</p>` : ""}

    <div class="footer">
      <p>Este documento constituye una factura de venta según normativa DIAN.</p>
      <p>Generado por Orígenes Kicks - Sistema de Facturación Electrónica</p>
    </div>
  </div>
</body>
</html>
  `;
}

export default router;
