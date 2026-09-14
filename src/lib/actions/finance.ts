import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * LÓGICA DE CIERRES PARA LA PLAZA DE MERCADO
 * Diseñado para ser extremadamente sencillo y seguro.
 */

export async function calculateDailyTotals(storeId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const orders = await prisma.pedido.aggregate({
    where: {
      storeId,
      status: { in: ['CONFIRMADO', 'PROCESANDO', 'DESPACHADO', 'ENTREGADO'] },
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalSales: orders._sum.totalAmount || 0,
    totalOrders: orders._count.id || 0,
  };
}

export async function performDailyClosing(data: {
  storeId: string,
  userId: string,
  cashAmount: number,
  transferAmount: number,
  observations?: string
}) {
  const totals = await calculateDailyTotals(data.storeId);
  
  const closing = await prisma.dailyClosing.create({
    data: {
      storeId: data.storeId,
      closedById: data.userId,
      totalSales: totals.totalSales,
      totalOrders: totals.totalOrders,
      pendingOrders: 0, 
      cashAmount: data.cashAmount,
      transferAmount: data.transferAmount,
      observations: data.observations,
    },
  });

  return {
    success: true,
    closing,
    difference: (data.cashAmount + data.transferAmount) - Number(totals.totalSales),
  };
}

/**
 * REPORTES PARA EL DUEÑO
 */

export async function getFinancialReport(startDate: Date, endDate: Date, storeId?: string) {
  const closings = await prisma.dailyClosing.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      ...(storeId && { storeId }),
    },
    orderBy: { date: 'asc' },
  });

  const totalRevenue = closings.reduce((sum, c) => sum + Number(c.totalSales), 0);
  const totalCash = closings.reduce((sum, c) => sum + Number(c.cashAmount), 0);
  const totalTransfers = closings.reduce((sum, c) => sum + Number(c.transferAmount), 0);
  const totalOrders = closings.reduce((sum, c) => sum + c.totalOrders, 0);
  const totalDiff = closings.reduce((sum, c) => sum + (Number(c.cashAmount) + Number(c.transferAmount) - Number(c.totalSales)), 0);

  return {
    closings,
    summary: {
      totalRevenue,
      totalCash,
      totalTransfers,
      totalOrders,
      totalDiff,
    }
  };
}

/**
 * REPORTE DE PÉRDIDAS Y AJUSTES (MOVIMIENTOS NO VENTA)
 */
export async function getInventoryLossReport(startDate: Date, endDate: Date, storeId?: string) {
  const logs = await prisma.inventoryLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      changeType: { not: 'SALE' },
      ...(storeId && { storeId }),
    },
    include: {
      variant: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  const report = logs.map(log => ({
    date: log.createdAt,
    product: log.variant.product.name,
    quantity: log.quantity,
    reason: log.reason,
    type: log.changeType,
    impact: Number(log.quantity) * Number(log.variant.product.basePrice)
  }));

  const totalLossValue = report.reduce((sum, item) => sum + item.impact, 0);
  const totalUnitsMoved = report.reduce((sum, item) => sum + item.quantity, 0);

  return {
    details: report,
    summary: {
      totalLossValue,
      totalUnitsMoved,
    }
  };
}
