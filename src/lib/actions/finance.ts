import prisma from '@/lib/db';
import { requireRole, ROLES_OWNER_ONLY, ROLES_STAFF } from '@/lib/auth-guard';

export async function calculateDailyTotals(storeId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const orders = await prisma.pedido.aggregate({
    where: {
      ...(storeId ? { storeId } : {}),
      status: { in: ['CONFIRMADO', 'PROCESANDO', 'DESPACHADO', 'ENTREGADO'] },
      createdAt: { gte: today, lt: tomorrow },
    },
    _sum: { totalAmount: true },
    _count: { id: true },
  });

  return {
    totalSales: orders._sum.totalAmount || 0,
    totalOrders: orders._count.id || 0,
  };
}

export async function performDailyClosing(data: {
  storeId: string;
  cashAmount: number;
  transferAmount: number;
  observations?: string;
}) {
  const auth = await requireRole(ROLES_STAFF);

  if (!auth.ok) {
    return { success: false, error: 'No tienes permisos para realizar el cierre' };
  }

  const cashAmount = Number(data.cashAmount);
  const transferAmount = Number(data.transferAmount);

  if (!data.storeId || !Number.isFinite(cashAmount) || cashAmount < 0 || !Number.isFinite(transferAmount) || transferAmount < 0) {
    return { success: false, error: 'Los valores del cierre no son válidos' };
  }

  const user = auth.dbUser;
  if (user.role !== 'OWNER' && user.role !== 'ADMIN' && data.storeId !== user.workStoreId) {
    return { success: false, error: 'No tienes acceso a esta tienda' };
  }

  const totals = await calculateDailyTotals(data.storeId);
  const pending = await prisma.pedido.count({
    where: {
      storeId: data.storeId,
      status: { in: ['RECIBIDO'] },
      createdAt: { gte: startOfToday(), lt: startOfTomorrow() },
    },
  });

  const closing = await prisma.dailyClosing.create({
    data: {
      storeId: data.storeId,
      closedById: user.id,
      totalSales: totals.totalSales,
      totalOrders: totals.totalOrders,
      pendingOrders: pending,
      cashAmount,
      transferAmount,
      observations: data.observations?.trim() || null,
    },
  });

  return {
    success: true,
    closing,
    difference: cashAmount + transferAmount - Number(totals.totalSales),
  };
}

export async function getFinancialReport(startDate: Date, endDate: Date, storeId?: string) {
  const auth = await requireRole(ROLES_OWNER_ONLY);

  if (!auth.ok) {
    return { closings: [], summary: { totalRevenue: 0, totalCash: 0, totalTransfers: 0, totalOrders: 0, totalDiff: 0 } };
  }

  const closings = await prisma.dailyClosing.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      ...(storeId ? { storeId } : {}),
    },
    orderBy: { date: 'asc' },
  });

  const totalRevenue = closings.reduce((sum, c) => sum + Number(c.totalSales), 0);
  const totalCash = closings.reduce((sum, c) => sum + Number(c.cashAmount), 0);
  const totalTransfers = closings.reduce((sum, c) => sum + Number(c.transferAmount), 0);
  const totalOrders = closings.reduce((sum, c) => sum + c.totalOrders, 0);
  const totalDiff = closings.reduce(
    (sum, c) => sum + Number(c.cashAmount) + Number(c.transferAmount) - Number(c.totalSales),
    0
  );

  return {
    closings,
    summary: { totalRevenue, totalCash, totalTransfers, totalOrders, totalDiff },
  };
}

export async function getInventoryLossReport(startDate: Date, endDate: Date, storeId?: string) {
  const auth = await requireRole(ROLES_OWNER_ONLY);

  if (!auth.ok) {
    return { details: [], summary: { totalLossValue: 0, totalUnitsMoved: 0 } };
  }

  const logs = await prisma.inventoryLog.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      changeType: 'ADJUSTMENT',
      quantity: { lt: 0 },
      ...(storeId ? { storeId } : {}),
    },
    include: { variant: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const report = logs.map((log) => ({
    date: log.createdAt,
    product: log.variant.product.name,
    quantity: Math.abs(log.quantity),
    reason: log.reason,
    type: log.changeType,
    impact: Math.abs(log.quantity) * Number(log.variant.product.basePrice),
  }));

  return {
    details: report,
    summary: {
      totalLossValue: report.reduce((sum, item) => sum + item.impact, 0),
      totalUnitsMoved: report.reduce((sum, item) => sum + item.quantity, 0),
    },
  };
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfTomorrow() {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
}
