
# ORÍGENES KICKS

## 1. Identificación del proyecto

## 2. Descripción general

## 3. Problema

## 4. Justificación

## 5. Objetivos

## 6. Alcance

## 7. Stakeholders

## 8. Usuarios y roles

## 9. Requerimientos funcionales

### RF1. Gestión de Catálogo y Productos
- **RF1.1 Visualización de Productos:** El sistema debe permitir a los usuarios navegar por el catálogo de calzado, viendo imágenes, descripciones y precios.
- **RF1.2 Filtros de Búsqueda:** El usuario debe poder filtrar productos por marca, modelo, talla y rango de precio.
- **RF1.3 Gestión de Stock:** El sistema debe mostrar la disponibilidad de tallas en tiempo real para cada modelo.
- **RF1.4 Panel de Administración:** El administrador debe poder crear, editar y eliminar productos, así como actualizar las cantidades de stock.

### RF2. Gestión del Carrito y Compras
- **RF2.1 Control del Carrito:** El usuario debe poder añadir, modificar cantidades y eliminar productos de un carrito de compras virtual.
- **RF2.2 Validación de Disponibilidad:** El sistema debe verificar que el producto siga disponible en la talla seleccionada justo antes de proceder al pago.
- **RF2.3 Procesamiento de Pagos:** El sistema debe integrarse con una pasarela de pagos para procesar transacciones seguras.
- **RF2.4 Generación de Pedidos:** Al finalizar la compra, el sistema debe generar un número de pedido y enviar un resumen al correo del cliente.

### RF3. Sistema de Apartados (Reservas)
- **RF3.1 Solicitud de Apartado:** El sistema debe permitir al usuario seleccionar un producto para "apartarlo" mediante un pago inicial.
- **RF3.2 Gestión de Abonos:** El sistema debe registrar el monto abonado y calcular el saldo pendiente del producto apartado.
- **RF3.3 Control de Fechas Límite:** El sistema debe asignar una fecha de vencimiento al apartado y notificar al usuario antes de que expire.
- **RF3.4 Liberación Automática:** Si el plazo vence sin el pago total, el sistema debe reintegrar automáticamente el stock al catálogo.

### RF4. Gestión de Usuarios y Perfiles
- **RF4.1 Autenticación:** El sistema debe permitir el registro, inicio de sesión y recuperación de contraseña de los usuarios.
- **RF4.2 Historial de Usuario:** El usuario debe tener un panel donde pueda ver sus compras pasadas y el estado de sus apartados activos.
- **RF4.3 Control de Roles:** El sistema debe diferenciar entre usuarios "Cliente" y "Administrador", restringiendo el acceso a las funciones de gestión.

### RF5. Logística y Entregas
- **RF5.1 Cálculo de Envío:** El sistema debe calcular el costo de envío basado en la dirección de entrega seleccionada.
- **RF5.2 Seguimiento de Estado:** El administrador debe poder cambiar el estado del pedido (Ej: Pendiente $\rightarrow$ Empacando $\rightarrow$ Enviado $\rightarrow$ Entregado).

### RF6. Notificaciones
- **RF6.1 Alertas de Pedido:** El sistema debe enviar notificaciones (email/push) sobre cambios en el estado del pedido.
- **RF6.2 Alertas de Vencimiento:** El sistema debe notificar al usuario cuando falten pocos días para vencer el plazo de un apartado.

## 10. Requerimientos no funcionales

## 11. Historias de usuario

### 👤 Rol: Cliente
| ID | Historia de Usuario | Criterio de Aceptación |
|:---|:---|:---|
| **HU1** | Como cliente, quiero navegar por el catálogo de calzado para conocer los modelos disponibles y sus precios. | El usuario puede ver una lista de productos con imagen, nombre y precio. |
| **HU2** | Como cliente, quiero filtrar los tenis por talla y marca para encontrar rápidamente el modelo que busco. | El sistema muestra solo los productos que coinciden con los filtros seleccionados. |
| **HU3** | Como cliente, quiero añadir productos al carrito para agrupar mis compras antes de pagar. | Los productos se guardan en el carrito y se muestra el total acumulado. |
| **HU4** | Como cliente, quiero realizar el pago de mi pedido para finalizar la compra y recibir mis tenis. | El sistema procesa el pago y genera un número de orden confirmado. |
| **HU5** | Como cliente, quiero **apartar un producto** mediante un pago inicial para asegurarlo mientras reúno el resto del dinero. | El sistema permite pagar un porcentaje, bloquea el stock y registra la fecha de vencimiento. |
| **HU6** | Como cliente, quiero ver el estado de mis pedidos y apartados en mi perfil para saber cuándo llegarán mis productos. | El usuario tiene acceso a un historial con estados claros (Ej: "En camino", "Pendiente de pago"). |
| **HU7** | Como cliente, quiero recibir una notificación cuando mi apartado esté por vencer para evitar perder la reserva. | El sistema envía un aviso automático X días antes de la fecha límite. |

### 🔑 Rol: Administrador
| ID | Historia de Usuario | Criterio de Aceptación |
|:---|:---|:---|
| **HU8** | Como administrador, quiero agregar nuevos modelos de calzado y actualizar el stock para mantener el catálogo al día. | El administrador puede subir fotos, precios y cantidades por talla. |
| **HU9** | Como administrador, quiero cambiar el estado de un pedido (Ej: de "Procesando" a "Enviado") para informar al cliente. | El cambio de estado se refleja inmediatamente en el perfil del cliente. |
| **HU10** | Como administrador, quiero gestionar los abonos de los apartados para llevar un control financiero de las reservas. | El sistema permite registrar pagos parciales y calcular el saldo restante. |
| **HU11** | Como administrador, quiero que el sistema libere automáticamente el stock de apartados vencidos para que otros clientes puedan comprarlos. | El producto vuelve a estar "Disponible" si el cliente no pagó en el plazo establecido. |

## 12. Reglas de negocio

### A. Gestión de Inventario y Productos
1. **Unicidad de Stock:** Un producto no puede venderse si su cantidad en inventario es 0.
2. **Tallas y Modelos:** Cada modelo de calzado debe tener asociadas sus tallas disponibles y el stock específico por talla.
3. **Actualización de Stock:** El inventario debe descontarse inmediatamente después de que se confirme una compra o un "apartado".

### B. Proceso de Compra y Carrito
4. **Vigencia del Carrito:** Los productos añadidos al carrito no reservan el stock; el stock se valida solo al momento de iniciar el proceso de pago.
5. **Mínimo de Compra:** No se establece un monto mínimo de compra, a menos que se defina lo contrario para promociones específicas.
6. **Cancelaciones:** Un pedido puede ser cancelado por el usuario solo si el estado es "Pendiente" o "Procesando", pero no si ya ha sido "Enviado".

### C. Sistema de "Apartados" (Reservas)
7. **Pago Inicial:** Para apartar un producto, el cliente debe realizar un pago inicial (porcentaje a definir por administración).
8. **Plazo de Pago:** El cliente tiene un plazo máximo establecido para liquidar el saldo restante del producto.
9. **Penalización por Incumplimiento:** Si el pago no se completa en el plazo establecido, el producto vuelve al inventario y el abono inicial se gestiona según las políticas de la tienda.
10. **Reserva de Stock:** A diferencia del carrito, un "apartado" bloquea el stock del producto para otros clientes.

### D. Domicilios y Entregas
11. **Costo de Envío:** El costo del domicilio se calcula según la zona de entrega.
12. **Envío Gratis:** Se otorgará envío gratis en compras que superen el monto mínimo definido por la administración.
13. **Tiempos de Entrega:** El tiempo estimado de entrega debe informarse al cliente antes de finalizar la compra.

### E. Usuarios y Seguridad
14. **Cuentas:** Para realizar un "apartado", es obligatorio que el usuario tenga una cuenta registrada y verificada.
15. **Roles:** Solo el administrador puede modificar precios, gestionar el inventario maestro y cambiar estados de pedidos.

## 13. Casos de uso

## 14. Arquitectura del sistema

### 14.1. Patrón Arquitectónico
El sistema implementa una arquitectura basada en capas dentro de un entorno de **Serverless/Edge functions** (característico de Next.js), dividida de la siguiente manera:

1.  **Capa de Presentación (Frontend):**
    - **Tecnología:** Next.js (React) con TypeScript.
    - **Responsabilidad:** Interfaz de usuario, manejo de estados locales, validaciones de formulario y renderizado de componentes (Server Components y Client Components).
    - **Estilo:** Tailwind CSS para un diseño responsivo y moderno.

2.  **Capa de Lógica de Negocio (API / Server Actions):**
    - **Tecnología:** Next.js API Routes / Server Actions.
    - **Responsabilidad:** Procesar las solicitudes del cliente, validar la identidad del usuario, aplicar las Reglas de Negocio (Ej: validar stock antes de un pedido) y coordinar la persistencia de datos.

3.  **Capa de Acceso a Datos (ORM):**
    - **Tecnología:** Prisma ORM.
    - **Responsabilidad:** Actuar como puente entre la lógica de negocio y la base de datos, proporcionando un tipado fuerte (Type-safe) para evitar errores de consulta.

4.  **Capa de Persistencia (Base de Datos):**
    - **Tecnología:** PostgreSQL.
    - **Responsabilidad:** Almacenamiento relacional y seguro de toda la información (Usuarios, Productos, Pedidos, Apartados).

### 14.2. Flujo de Datos (Ejemplo: Realizar un Apartado)
Para entender cómo interactúan estas capas, este es el camino de una solicitud:
`Usuario` $\rightarrow$ `Click en "Apartar"` $\rightarrow$ `Componente Next.js` $\rightarrow$ `Server Action / API Endpoint` $\rightarrow$ `Prisma Client` $\rightarrow$ `PostgreSQL` $\rightarrow$ `Confirmación de Respuesta` $\rightarrow$ `Interfaz de Usuario`.

### 14.3. Diagrama Conceptual
- **Cliente/Navegador** $\rightarrow$ (HTTPS/JSON) $\rightarrow$ **Next.js Frontend**
- **Next.js Frontend** $\rightarrow$ (Server-side Calls) $\rightarrow$ **Next.js Backend/API**
- **Next.js Backend/API** $\rightarrow$ (Queries/Mutations) $\rightarrow$ **Prisma ORM**
- **Prisma ORM** $\rightarrow$ (SQL) $\rightarrow$ **PostgreSQL Database**
- **Next.js Backend/API** $\rightarrow$ (Integraciones) $\rightarrow$ **Pasarela de Pagos / Email**

### 14.4. Consideraciones de Despliegue
- **Hosting:** El proyecto está preparado para despliegues en plataformas como **Netlify** o **Vercel**.
- **Base de Datos:** Configuración compatible con bases de datos en la nube mediante variables de entorno (`DATABASE_URL`, `DIRECT_URL`).

## 15. Tecnologías

El sistema está construido sobre un stack moderno orientado a la escalabilidad y el tipado fuerte:

### A. Framework y Lenguaje
- **Frontend & Backend:** Next.js 14.2.10 (App Router).
- **Lenguaje:** TypeScript 5.9.3.
- **Librería de UI:** React 18.3.1.

### B. Datos y Persistencia
- **Base de Datos:** PostgreSQL (alojada en Supabase).
- **ORM:** Prisma 6.19.3.
- **Validación de Esquemas:** Zod 3.23.8.

### C. Gestión de Estado y Estilos
- **Estado Global:** Zustand 4.5.5.
- **Estilos:** Tailwind CSS 3.4.19 con `tailwind-merge` y `clsx` para gestión dinámica de clases.
- **Iconografía:** Lucide React.

### D. Seguridad y Autenticación
- **Autenticación:** Basada en JSON Web Tokens (jsonwebtoken) y hashing de contraseñas con Bcrypt.
- **Sesiones:** Soporte para SSR mediante `@supabase/ssr`.

### E. Infraestructura
- **Runtime:** Node.js >= 18.0.0.
- **Despliegue:** Optimizado para Netlify / Vercel.

## 16. Modelo de datos

El sistema utiliza una base de datos relacional gestionada mediante Prisma ORM. A continuación se describen las entidades principales y su propósito:

### A. Núcleo de Productos e Inventario
- **Product:** Define la información general del calzado (nombre, descripción, precio base, categoría).
- **Variant:** Gestiona las combinaciones específicas de **talla y color**, almacenando el stock real disponible por cada variante.
- **InventoryLog:** Registra cada movimiento de stock (entrada por compra, salida por venta, ajustes), asegurando la trazabilidad.
- **Provider:** Almacena la información de los proveedores de calzado.

### B. Gestión de Ventas y Clientes
- **User:** Gestiona los perfiles de usuario con roles (`CLIENT`, `SELLER`, `DELIVERY`, `ADMIN`) y permisos específicos.
- **Cart & CartItem:** Permite la persistencia de productos seleccionados por el cliente antes de finalizar la compra.
- **Pedido (Order):** Registra la transacción final, el monto total, el método de pago y el estado del pedido.
- **PedidoItem:** Detalle de los productos y cantidades incluidos en cada pedido.

### C. Sistema de Apartados (Layaway)
- **Apartado:** Gestiona la reserva de productos. Almacena el monto total, el saldo pendiente (`balanceDue`) y la fecha límite de pago (`dueDate`).
- **ApartadoItem:** Vincula los productos específicos que han sido reservados.
- **Abono:** Registra cada pago parcial realizado por el cliente para liquidar un apartado, incluyendo la verificación del administrador.

### D. Logística y Facturación
- **Envio:** Gestiona la dirección de entrega, el número de seguimiento y el estado del despacho.
- **Factura & FacturaItem:** Implementa la estructura para la facturación electrónica, incluyendo campos técnicos para validación (CUFE, QR).

### E. Estructura Organizacional y Control
- **Store:** Permite la gestión de múltiples sucursales físicas, cada una con su propio inventario y administrador.
- **DailyClosing:** Registra el cierre de caja diario por sucursal, consolidando ventas, órdenes y montos de efectivo/transferencias.
- **AppLicense:** Controla la licencia de uso del software.

## 17. Inventario

## 18. Carrito

## 19. Compras

## 20. Apartados

## 21. Domicilios

## 22. Notificaciones

## 23. Seguridad

## 24. API

El sistema expone una API RESTful mediante Next.js Route Handlers para gestionar la comunicación entre el cliente y el servidor.

### A. Endpoints Existentes (Implementados)
- **`/api/health`**: Verifica el estado de salud del servidor y la conexión a la DB.
- **`/api/products`**: Gestión del catálogo (GET para listar, POST/PUT/DELETE para admin).
- **`/api/user`**: Gestión de perfiles, autenticación y roles.
- **`/api/invoice/[id]`**: Consulta y generación de facturas electrónicas basadas en el ID del pedido.

### B. Endpoints Propuestos (Por Implementar)
Para cumplir con los requerimientos de "Apartados" y "Carrito", se deben desarrollar los siguientes:

#### 1. Módulo de Carrito
- **`POST /api/cart/add`**: Añadir una variante de producto al carrito del usuario.
- **`DELETE /api/cart/remove/[itemId]`**: Eliminar un item del carrito.
- **`PUT /api/cart/update`**: Modificar la cantidad de un producto.

#### 2. Módulo de Apartados (Layaway)
- **`POST /api/apartados`**: Crear una nueva reserva. Valida stock y procesa el pago inicial.
- **`GET /api/apartados/my`**: Lista los apartados activos del usuario autenticado.
- **`POST /api/apartados/[id]/abono`**: Registrar un nuevo pago parcial para reducir el saldo pendiente.
- **`PATCH /api/apartados/[id]/status`**: (Solo Admin) Cambiar el estado del apartado (Ej: a Completado o Cancelado).

#### 3. Módulo de Pedidos y Envíos
- **`POST /api/pedidos`**: Convertir un carrito en un pedido final.
- **`GET /api/pedidos/history`**: Historial de compras del cliente.
- **`PATCH /api/pedidos/[id]/shipping`**: Actualizar el estado del envío (En ruta, Entregado).

## 25. Interfaces

## 26. Backlog

Lista de tareas pendientes priorizadas para completar el MVP (Producto Mínimo Viable) de OrígenesKicks.

### 🔴 Prioridad Alta (Crítico para el negocio)
- [ ] **Implementar Lógica de Apartados:** Desarrollar los endpoints de creación de apartados y gestión de abonos.
- [ ] **Control de Stock en Tiempo Real:** Asegurar que el stock se bloquee inmediatamente al crear un apartado y se descuente al finalizar un pedido.
- [ ] **Pasarela de Pagos:** Integrar un proveedor de pagos (Ej: Stripe, Mercado Pago o PayU) para procesar abonos y compras.
- [ ] **Autenticación Completa:** Asegurar que solo usuarios registrados puedan acceder a la funcionalidad de apartados.

### 🟡 Prioridad Media (Mejora de experiencia y gestión)
- [ ] **Panel de Administración de Inventario:** Interfaz para que el admin cree productos y variantes sin usar la DB directamente.
- [ ] **Sistema de Notificaciones:** Implementar avisos automáticos de vencimiento de apartados (Email/Push).
- [ ] **Gestión de Envíos:** Interface para actualizar el estado de los pedidos y generar números de guía.
- [ ] **Filtros Avanzados de Catálogo:** Implementar los filtros por talla, marca y precio en el frontend.

### 🟢 Prioridad Baja (Optimización y Plus)
- [ ] **Visor de Modelos 3D:** Implementar la visualización de los `model3dUrl` definidos en la tabla `Product`.
- [ ] **Reportes de Cierre Diario:** Desarrollar la vista para que el dueño vea los `DailyClosing`.
- [ ] **Facturación Electrónica Automatizada:** Integrar la generación de CUFE y QR con el proveedor de facturación.
- [ ] **Sistema de Cupones de Descuento:** Implementar descuentos temporales sobre el `basePrice`.

## 27. Sprint y planificación

## 28. Trazabilidad

## 29. Pruebas

## 30. Errores e incidencias

## 31. Cambios y decisiones

## 32. Estado del proyecto

## 33. Definition of Done

## 34. Historial de versiones