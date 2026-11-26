# Estructura del Proyecto - OrígenesKicks (Next.js App Router)

## Objetivo
Facilitar el mantenimiento y escalabilidad del proyecto mediante una separación clara de responsabilidades.

## Visión General de la Carpeta `src/`

src/
├── app/                    # App Router: Rutas, Layouts y API Handlers
│   ├── (auth)/             # Grupo: Login, Registro (Layout minimalista)
│   ├── (content)/          # Grupo: Dashboard, Productos (Layout con Navbar/Sidebar)
│   ├── api/                # Endpoints de la API interna (/api/...)
│   ├── layout.tsx          # Root Layout (Providers, fuentes globales)
│   └── page.tsx            # Home Page (/)
├── components/             # Componentes compartidos y atómicos
│   ├── ui/                 # Componentes base (Botones, Inputs, Cards)
│   └── layout/             # Componentes de estructura (Navbar, Footer)
├── features/               # Lógica y UI específica por dominio (Auth, Products, etc.)
├── lib/                    # Utilidades, cliente de DB y Server Actions
├── services/               # Capa de datos (Llamadas a API externa o interna)
├── types/                  # Definiciones de TypeScript
├── contexts/               # Contextos de React (Auth, Carrito)
├── stores/                 # Estado global (Stand)
└── hooks/                  # Hooks personalizados

## Convenciones de Desarrollo

| Capa               | Responsabilidad                                               |
|:-------------------|:--------------------------------------------------------------|
| **app/**           | Definición de rutas y manejo de peticiones.                   |
| **features/**      | Componentes complejos que pertenecen a un dominio específico. |
| **lib/actions.ts** | Mutaciones de datos seguras (Server Actions).                 |
| **services/**      | Encapsulación de fetch/axios para obtener datos.              |
| **types/index.ts** | Punto central de exportación de interfaces.                   |

## Path Aliases
Usa siempre importaciones absolutas para mayor claridad:
- `@/components/*`
- `@/features/*`
- `@/lib/*`
- `@/hooks/*`

## Lógica de Negocio Crítica

### Reserva de 24 Horas
- **Flujo**: Cuando un cliente reserva (Checkout), el stock disminuye inmediatamente.
- **Estabilidad**: La función `releaseExpiredReservations` en `lib/actions.ts` garantiza que si no hay aprobación administrativa en 24 horas, el producto vuelve automáticamente a la vitrina.
- **Seguridad**: Las acciones de aprobación (`approveOrder`) están protegidas y solo pueden ser ejecutadas por usuarios con rol `ADMIN` o `SELLER`.

## Activos y Publicidad
- **Publicidad**: El componente `PromoBanner` en `features/products` gestiona la identidad visual de la vitrina.
- **Imágenes**: Se recomienda usar el bucket de Supabase `product-images` para el catálogo real.
## Flujo de trabajo para asistentes IA

Al iniciar una nueva tarea:

1. Leer AGENTS.md.
2. Leer PROJECT_STRUCTURE.md.
3. Consultar ORIGENESKICKS_DOCUMENTACION_MAESTRA.md cuando existan dudas de negocio.
4. Consultar CLIENT_GUIDE.md para requisitos funcionales.
5. Consultar DEPLOY_GUIDE.md para despliegue e infraestructura.
6. Localizar únicamente los archivos relacionados con la tarea.
7. Comprender el flujo actual antes de modificar código.
8. Implementar la solución con el menor impacto posible.
9. Mantener compatibilidad con el resto del proyecto.
