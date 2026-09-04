# Guía de Despliegue - Orígenes Kicks 🚀

El proyecto ha sido preparado para un despliegue profesional con **Next.js**, **Supabase** y **Prisma**.

## 1. Subir a Git (GitHub / GitLab / Bitbucket)

Ya he realizado el commit local con todos los cambios. Ahora sigue estos pasos en tu terminal para subirlo a la nube:

```bash
# 1. Agrega tu repositorio remoto (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/origenes-kicks.git

# 2. Sube los cambios
git push -u origin main
```

## 2. Desplegar en Netlify

1. Ve a [Netlify](https://app.netlify.com/) e inicia sesión.
2. Haz clic en **"Import from Git"** y selecciona tu repositorio.
3. Netlify detectará automáticamente el archivo `netlify.toml` y configurará el build:
   - **Build Command**: `npx prisma generate && next build`
   - **Publish directory**: `.next`
4. **IMPORTANTE: Variables de Entorno**
   Ve a *Site Settings > Environment Variables* y agrega estas claves (copia los valores de t`.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL` (Usa el puerto 6543 de Supabase)
   - `DIRECT_URL` (Usa el puerto 5432 de Supabase)

## 3. Configurar Dominio Propio

Para usar **OrigenesKicks**:
1. En Netlify, ve a **Domain Management**.
2. Haz clic en **Add Custom Domain** y escribe `origeneskicks.app`.
3. sigue los pasos para configurar los DNS en tu registrador de dominios.

## 4. Sincronizar Base de Datos
Una vez configuradas las variables en Netlify, ejecuta este comando en tu PC local para asegurarte de que Supabase tenga las últimas tablas:
```bash
npx prisma db push
```

¡Tu tienda estará en línea y lista para vender! 👟✨
