# 👟 Orígenes Kicks - Manual de Arquitectura y Operación

## 🚀 Visión General
Sistema de e-commerce de alta gama para calzado, diseñado específicamente para operar en entornos de venta rápida (Plaza de Mercado) con una experiencia de usuario premium basada en 3D y Realidad Aumentada.

## 🛠️ Stack Tecnológico
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Backend:** Server Actions, Prisma ORM, PostgreSQL (Docker).
- **Seguridad:** JWT (JOSE), Bcrypt, Middleware de Roles.
- **Experiencia:** <model-viewer> (3D/AR), PWA (Progressive Web App).
- **Pagos:** Wompi (PSE/Tarjetas), Pagos Manuales.

## 📁 Módulos del Sistema

### 1. Gestión de Acceso y Seguridad (/src/lib/actions/auth.ts)
- **Self-Service:** Registro autónomo de clientes con validación de correo.
- **Auth Pro:** Sistema de tokens JWT con cookies HTTP-only y expiración de 7 días.
- **Control de Roles:** Redirección inteligente según el rol (ADMIN $\rightarrow$ Dashboard Admin, SELLER $\rightarrow$ Modo Tienda, CLIENT $\rightarrow$ Vitrina).

### 2. Motor de Inventario y Trazabilidad (/src/lib/actions/inventory.ts)
- **Stock en Tiempo Real:** Validación inmediata antes de cada venta.
- **Ajustes de Inventario:** Módulo para registrar daños, robos o errores con motivo obligatorio.
- **Auditoría Total:** Logs detallados de cada movimiento de calzado (Salió por venta, entró por compra, salió por daño).

### 3. Vitrina 3D y Experiencia AR (/src/components/product/ShoeViewer.tsx)
- **Estudio Virtual:** Iluminación profesional con sombras dinámicas y fondos radiales.
- **Interacción 360°:** Zoom, rotación y exploración completa del producto.
- **Realidad Aumentada (AR):** Capacidad de proyectar el zapato en el espacio real del cliente vía móvil.

### 4. Operación "Modo Plaza" (/src/app/dashboard/store)
- **UI de Alta Velocidad:** Botones gigantes y flujos simplificados para vendedores en entorno rápido.
- **Ciclo de Vida del Pedido:** Gestión rápida de estados (Recibido $\rightarrow$ Confirmado $\rightarrow$ Despachado $\rightarrow$ Entregado).
- **Notificaciones:** Automatización de avisos vía WhatsApp al cliente en cambios de estado.

### 5. Control Financiero y Cierres (/src/lib/actions/finance.ts)
- **Cierres de Caja:** Automatización de sumas diarias vs. saldo físico en caja.
- **Reportes de Rentabilidad:** Análisis mensual de ingresos y volumen de ventas.
- **Control de Pérdidas:** Reporte económico de calzado perdido o dañado (No-Venta).

### 6. Posventa y Fidelización (/src/app/(content)/posventa)
- **Tracking Público:** Rastreo de pedidos mediante código único.
- **Visualización de Ruta:** Mapa interactivo y barra de progreso para reducir la ansiedad del cliente.

## 📦 Flujo de Datos Maestro (End-to-End)
Cliente $\rightarrow$ Carrito $\rightarrow$ Pago (Wompi/Manual) $\rightarrow$ Pedido $\rightarrow$ Aprobación Admin $\rightarrow$ Factura $\rightarrow$ Notificación WhatsApp $\rightarrow$ Despacho $\rightarrow$ Rastreo Posventa $\rightarrow$ Cierre de Caja Diario.

## 📱 Capacidad PWA
La aplicación es instalable en dispositivos móviles, permitiendo que el vendedor opere sin depender totalmente del navegador, con carga acelerada y acceso directo desde la pantalla de inicio.
