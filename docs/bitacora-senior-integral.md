# Bitácora — revisión senior integral

Fecha: 2026-09-18

## Alcance

Revisión estructural antes de producción sobre la rama `review/senior-integral`.

## Correcciones consolidadas

- Eliminación de rutas duplicadas y autenticación legacy sin referencias.
- Separación explícita de Server Actions y componentes cliente.
- Cierre financiero ejecutado exclusivamente en servidor y limitado a OWNER/ADMIN.
- Ajustes de inventario limitados a OWNER/ADMIN.
- Estados de pedidos diferenciados entre gestión administrativa y despacho.
- Rastreo público movido a Route Handler para evitar importar lógica de servidor desde el cliente.
- Consulta pública endurecida para aceptar UUID completo o número de factura exacto.
- Facturación con impuesto basado en `Product.taxRate`, con 19 % como valor predeterminado.
- Numeración de factura actualizada de forma atómica dentro de la transacción.
- Aprobación de pedidos restringida a la tienda autorizada para ADMIN.
- Contacto de WhatsApp del rastreo obtenido desde la tienda, sin número placeholder.

## Regla de validación

No se debe desplegar a producción ni fusionar a `main` hasta obtener un CI verde sobre esta revisión.
