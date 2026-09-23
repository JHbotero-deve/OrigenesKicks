/*
  Warnings:

  - You are about to drop the column `created_at` on the `app_licenses` table. All the data in the column will be lost.
  - You are about to drop the column `last_check` on the `app_licenses` table. All the data in the column will be lost.
  - You are about to drop the column `license_key` on the `app_licenses` table. All the data in the column will be lost.
  - You are about to drop the column `master_pin` on the `app_licenses` table. All the data in the column will be lost.
  - You are about to drop the column `owner_email` on the `app_licenses` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `app_licenses` table. All the data in the column will be lost.
  - You are about to drop the column `cash_amount` on the `daily_closings` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `daily_closings` table. All the data in the column will be lost.
  - You are about to drop the column `pending_orders` on the `daily_closings` table. All the data in the column will be lost.
  - You are about to drop the column `sent_to_email` on the `daily_closings` table. All the data in the column will be lost.
  - You are about to drop the column `total_orders` on the `daily_closings` table. All the data in the column will be lost.
  - You are about to drop the column `total_sales` on the `daily_closings` table. All the data in the column will be lost.
  - You are about to drop the column `transfer_amount` on the `daily_closings` table. All the data in the column will be lost.
  - You are about to drop the column `change_type` on the `inventory_logs` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `inventory_logs` table. All the data in the column will be lost.
  - You are about to drop the column `base_price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `discount_price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `is_special` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `model_3d_url` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sales_count` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `tax_rate` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `usage` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `contact_name` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_prefix` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `last_invoice_number` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `manager_id` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `permissions` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `cart_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `carts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoice_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `layaway_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `layaway_payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `layaways` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shippings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[licenseKey]` on the table `app_licenses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `licenseKey` to the `app_licenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerEmail` to the `app_licenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `app_licenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cashAmount` to the `daily_closings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalOrders` to the `daily_closings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSales` to the `daily_closings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transferAmount` to the `daily_closings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `product_variants` table without a default value. This is not possible if the table is not empty.
  - Made the column `store_id` on table `product_variants` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `price` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "daily_closings" DROP CONSTRAINT "daily_closings_closed_by_id_fkey";

-- DropForeignKey
ALTER TABLE "daily_closings" DROP CONSTRAINT "daily_closings_store_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_logs" DROP CONSTRAINT "inventory_logs_performed_by_id_fkey";

-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_factura_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_pedido_id_fkey";

-- DropForeignKey
ALTER TABLE "layaway_items" DROP CONSTRAINT "layaway_items_apartado_id_fkey";

-- DropForeignKey
ALTER TABLE "layaway_items" DROP CONSTRAINT "layaway_items_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "layaway_payments" DROP CONSTRAINT "layaway_payments_apartado_id_fkey";

-- DropForeignKey
ALTER TABLE "layaway_payments" DROP CONSTRAINT "layaway_payments_verified_by_id_fkey";

-- DropForeignKey
ALTER TABLE "layaways" DROP CONSTRAINT "layaways_client_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_pedido_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_client_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_store_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_store_id_fkey";

-- DropForeignKey
ALTER TABLE "shippings" DROP CONSTRAINT "shippings_pedido_id_fkey";

-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_manager_id_fkey";

-- DropIndex
DROP INDEX "app_licenses_license_key_key";

-- DropIndex
DROP INDEX "product_variants_sku_key";

-- DropIndex
DROP INDEX "stores_manager_id_key";

-- AlterTable
ALTER TABLE "app_licenses" DROP COLUMN "created_at",
DROP COLUMN "last_check",
DROP COLUMN "license_key",
DROP COLUMN "master_pin",
DROP COLUMN "owner_email",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "licenseKey" TEXT NOT NULL,
ADD COLUMN     "masterPin" TEXT,
ADD COLUMN     "ownerEmail" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "daily_closings" DROP COLUMN "cash_amount",
DROP COLUMN "created_at",
DROP COLUMN "pending_orders",
DROP COLUMN "sent_to_email",
DROP COLUMN "total_orders",
DROP COLUMN "total_sales",
DROP COLUMN "transfer_amount",
ADD COLUMN     "cashAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pendingOrders" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalOrders" INTEGER NOT NULL,
ADD COLUMN     "totalSales" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "transferAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "store_id" DROP NOT NULL,
ALTER COLUMN "closed_by_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "inventory_logs" DROP COLUMN "change_type",
DROP COLUMN "created_at",
ADD COLUMN     "changeType" TEXT NOT NULL DEFAULT 'ADJUSTMENT',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "impact" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "reason" DROP NOT NULL,
ALTER COLUMN "performed_by_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "store_id" SET NOT NULL,
ALTER COLUMN "size" DROP NOT NULL,
ALTER COLUMN "color" DROP NOT NULL,
ALTER COLUMN "sku" DROP NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "base_price",
DROP COLUMN "category",
DROP COLUMN "created_at",
DROP COLUMN "discount_price",
DROP COLUMN "gender",
DROP COLUMN "image_url",
DROP COLUMN "is_special",
DROP COLUMN "model_3d_url",
DROP COLUMN "sales_count",
DROP COLUMN "sku",
DROP COLUMN "tax_rate",
DROP COLUMN "updated_at",
DROP COLUMN "usage",
ADD COLUMN     "basePrice" DOUBLE PRECISION,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discountPrice" DOUBLE PRECISION,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isSpecial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "salesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "providers" DROP COLUMN "active",
DROP COLUMN "address",
DROP COLUMN "contact_name",
DROP COLUMN "created_at",
DROP COLUMN "email",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "created_at",
DROP COLUMN "image_url",
DROP COLUMN "invoice_prefix",
DROP COLUMN "last_invoice_number",
DROP COLUMN "manager_id",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invoicePrefix" TEXT NOT NULL DEFAULT 'FAC',
ADD COLUMN     "lastInvoiceNumber" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_at",
DROP COLUMN "permissions",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "cart_items";

-- DropTable
DROP TABLE "carts";

-- DropTable
DROP TABLE "invoice_items";

-- DropTable
DROP TABLE "invoices";

-- DropTable
DROP TABLE "layaway_items";

-- DropTable
DROP TABLE "layaway_payments";

-- DropTable
DROP TABLE "layaways";

-- DropTable
DROP TABLE "order_items";

-- DropTable
DROP TABLE "orders";

-- DropTable
DROP TABLE "shippings";

-- DropEnum
DROP TYPE "ApartadoStatus";

-- DropEnum
DROP TYPE "EnvioStatus";

-- DropEnum
DROP TYPE "FacturaStatus";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "Usage";

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "store_id" TEXT,
    "status" "PedidoStatus" NOT NULL DEFAULT 'RECIBIDO',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_items" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "pedido_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "invoiceNumber" INTEGER NOT NULL,
    "fullNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerId" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factura_items" (
    "id" TEXT NOT NULL,
    "factura_id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "size" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "factura_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envios" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "envios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administración" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "administración_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facturas_pedido_id_key" ON "facturas"("pedido_id");

-- CreateIndex
CREATE UNIQUE INDEX "envios_pedido_id_key" ON "envios"("pedido_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_licenses_licenseKey_key" ON "app_licenses"("licenseKey");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_items" ADD CONSTRAINT "factura_items_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_closings" ADD CONSTRAINT "daily_closings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_closings" ADD CONSTRAINT "daily_closings_closed_by_id_fkey" FOREIGN KEY ("closed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
