# Guía de Despliegue - Orígenes Kicks 🚀

## 1. Subir a Git

```bash
git add .
git commit -m "Seguridad: login real, roles OWNER/ADMIN/SELLER, portada, registro"
git push origin main
```

## 2. Aplicar los cambios de base de datos

Se agregó el rol `OWNER` al enum `Role`. Antes de desplegar, sincroniza el
esquema con tu base de Supabase:

```bash
npx prisma db push
```

## 3. Crear tu primer usuario Dueño (OWNER)

Todavía no existe una pantalla para "ascender" a alguien a dueño (a propósito:
así nadie puede auto-asignarse ese rol). El primer OWNER se crea a mano,
UNA sola vez:

1. Regístrate normalmente en `/register` (quedarás como `CLIENT`).
2. En Supabase → Table Editor → tabla `users`, busca tu fila por tu correo
   y cambia la columna `role` de `CLIENT` a `OWNER`.
3. Cierra sesión y vuelve a entrar en `/login` — ya entrarás como dueño.

Después, desde el panel de administración, ese OWNER puede crear cuentas de
`ADMIN` y `SELLER` (trabajador) usando `/api/staff` — nunca hace falta volver
a tocar la base de datos a mano para el resto del equipo.

## 4. Desplegar en Netlify

1. Ve a [Netlify](https://app.netlify.com/) e inicia sesión.
2. **"Import from Git"** y selecciona el repositorio `OrigenesKicks`.
3. Netlify detecta `netlify.toml` automáticamente:
   - Build Command: `npx prisma generate && next build`
   - Publish directory: `.next`
4. **Variables de entorno** (Site Settings → Environment Variables) —
   copia los valores reales desde tu `.env` local, nunca los subas al repo:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ nueva — necesaria para que `/register`
     y la creación de staff funcionen. Está en Supabase Dashboard →
     Project Settings → API → `service_role` (secreta, NUNCA con prefijo
     `NEXT_PUBLIC_`).
   - `DATABASE_URL` (puerto 6543, con `pgbouncer=true`)
   - `DIRECT_URL` (puerto 5432)
   - Opcionales: `APP_LICENSE_KEY`, `APP_OWNER_EMAIL`, `APP_MASTER_PIN`
5. Despliega. El primer build corre `prisma generate` automáticamente.

## 5. Configurar dominio propio

1. En Netlify → **Domain Management** → **Add Custom Domain**.
2. Sigue los pasos para apuntar los DNS desde tu registrador.

## 6. Verificación post-despliegue

- Entra a `/register` y crea una cuenta de prueba → debe quedar como CLIENT.
- Entra a `/login` con tu cuenta OWNER → debe redirigir a `/dashboard`.
- Como CLIENT, intenta visitar `/dashboard/logs` o `/dashboard/reports`
  directamente por URL → debe decir "Acceso denegado".
- Revisa que `/analisis-control` y `/analizis-control` ya NO existen
  (dan 404) — solo debe funcionar `/dashboard`... el panel maestro real
  vive protegido dentro de la app.

¡Tu tienda estará en línea y lista para vender! 👟✨
