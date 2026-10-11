# Puesta en marcha del panel admin

Pasos para dejar el sitio funcionando con las cuentas de Imagmed. Se hacen una sola vez, en orden.

## 1. Supabase

1. Crea el proyecto en [supabase.com](https://supabase.com) con la cuenta de Imagmed.
   - **Región:** `East US (North Virginia)`, la misma zona que las funciones de Vercel (`iad1`).
   - **Plan:** Free sirve para empezar. Pausa el proyecto tras ~7 días sin actividad (con visitas al sitio no ocurre; se reactiva desde el dashboard). Pro agrega respaldos diarios.
   - **Security:** deja marcado *Enable Data API*, desmarca *Automatically expose new tables* (la migración da permisos tabla por tabla) y marca *Enable automatic RLS*.
2. **Authentication → Sign In / Providers:**
   - Desactiva **Allow new users to sign up**.
   - Deja activo solo **Email**.
3. **Authentication → Multi-Factor:** confirma que **TOTP (App Authenticator)** está activo (lo está por defecto).
4. **Authentication → Policies → Password:**
   - Longitud mínima **16**.
   - Requisitos: minúsculas, mayúsculas y dígitos.
   - En Pro, activa **Leaked password protection**.
5. Copia `.env.example` como `.env` y llénalo:
   - `SUPABASE_URL` y `SUPABASE_KEY` (publishable): **Connect → Framework → Astro**. Copia el bloque tal cual.
   - `SUPABASE_SECRET_KEY`: **Project Settings → API Keys**.
   - `SUPABASE_DB_URL`: **Connect → Direct → Session pooler**, con la contraseña de la base. Otra opción: copia el `DATABASE_URL` de **Connect → ORM → Drizzle** y cámbiale el puerto `6543` por `5432`. Ese es el session pooler, que conviene para migrar.
6. **Aplica las migraciones** (`supabase/migrations/`) con Drizzle:

   ```sh
   pnpm db:migrar
   ```

## 2. Contenido inicial y cuenta admin

1. Carga el contenido actual: 12 categorías, 5 marcas, 6 equipos con sus fotos, FAQ, contacto y hero.

   ```sh
   node --env-file=.env scripts/semilla.mjs
   ```
2. Crea la cuenta admin. El script imprime una contraseña aleatoria de 32 caracteres que no se vuelve a mostrar: guárdala en un gestor de contraseñas.

   ```sh
   node --env-file=.env scripts/admin.mjs crear correo@imagmed.mx
   ```
3. **De inmediato** levanta el sitio (`pnpm dev`), entra a `/admin/entrar` y registra la app autenticadora con el QR.
   - Mientras no haya autenticador registrado, la contraseña sola permite registrarlo. Después, Supabase exige el 2FA para agregar otro.
   - Recomendado: guarda también la clave del QR en un segundo dispositivo o en el gestor de contraseñas.
4. Comprueba que el público no puede escribir ni ver lo oculto:

   ```sh
   node --env-file=.env scripts/verificar-rls.mjs
   ```

## Equipo: la función que crea miembros

El super admin agrega miembros desde **/admin/equipo**: escribe el correo, asigna una contraseña y elige el rol.
- **Miembro:** edita el contenido.
- **Super admin:** además gestiona el equipo.

Eso lo hace la Edge Function `supabase/functions/equipo`. La llave secreta vive dentro de Supabase, no en Vercel. Se despliega una vez, y de nuevo cada vez que cambie su código:

1. Genera un token en [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) y ponlo en `SUPABASE_ACCESS_TOKEN` del `.env`.
2. Corre:

   ```sh
   pnpm funciones
   ```

La primera cuenta (super admin) se crea con `scripts/admin.mjs crear`. El resto del equipo, desde el panel.

## 3. Vercel

1. Importa el repositorio con la cuenta de Imagmed. Hobby funciona técnicamente igual (no se pausa), pero sus términos lo limitan a uso no comercial.
2. **Settings → Environment Variables** (Production y Preview): solo `SUPABASE_URL` y `SUPABASE_KEY`. **Nunca** la secret key.
3. **Settings → Domains:** agrega el dominio de Imagmed y ponlo también en `astro.config.mjs` → `site`.
4. **Firewall → Rules:** agrega un rate limit para `POST` a `/admin/entrar` y `/admin/verificar` (p. ej. 10 por minuto por IP).
   - Supabase ve todas las peticiones con la IP del servidor, así que el freno por persona tiene que ir aquí.
5. **Prueba en un deploy de Preview.** En `pnpm dev` la caché está apagada, así que hay que probar en el deploy:
   - Entra al admin.
   - Cambia un texto del hero.
   - Recarga la landing: debe verse en segundos. La primera visita después de guardar puede mostrar la versión anterior mientras se regenera.

## Cambiar el esquema de la base

Las tablas, restricciones y políticas RLS viven en `src/db/esquema.ts` (Drizzle). La app consulta por la API de Supabase y del esquema solo toma los tipos de las filas.

1. Edita `src/db/esquema.ts`.
2. Genera la migración y revisa el SQL que produce:

   ```sh
   pnpm db:generar
   ```
3. Aplícala:

   ```sh
   pnpm db:migrar
   ```

Lo que Drizzle no expresa (funciones, `EXCLUDE`, `GRANT`, bucket y políticas de Storage) va en una migración SQL propia: `pnpm drizzle-kit generate --custom --name=algo` y escribes el SQL en el archivo que crea.

**No uses `drizzle-kit push`.** Compara contra la base real y quitaría lo que no está en el esquema, como la restricción que impide campañas encimadas.

## Recuperar el acceso

| Situación | Comando |
| --- | --- |
| Un miembro olvidó la contraseña o perdió el celular | El super admin, en **/admin/equipo → Acciones** |
| El super admin olvidó la contraseña | `node --env-file=.env scripts/admin.mjs contrasena correo@imagmed.mx` |
| El super admin perdió el celular del 2FA | `node --env-file=.env scripts/admin.mjs quitar-2fa correo@imagmed.mx` (también cambia la contraseña) |

Las sesiones del admin duran como máximo 8 horas. «Salir» cierra la sesión en todos los dispositivos.

## Desarrollo local sin la nube

Con Docker (Docker Desktop u OrbStack) se puede levantar Supabase en tu máquina. `config.toml` ya trae los signups apagados y el TOTP activo.

`supabase start` aplica solo las migraciones de `supabase/migrations`, porque tienen el prefijo de fecha que entiende la CLI. En esa base local **no** corras además `pnpm db:migrar`.

```sh
npx supabase@2.118.0 start   # imprime URL y llaves locales para el .env
node --env-file=.env scripts/semilla.mjs
node --env-file=.env scripts/admin.mjs crear admin@local.test
```
