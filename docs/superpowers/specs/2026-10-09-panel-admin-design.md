# Panel admin de Imagmed: diseño

Fecha: 2026-10-09. Estado: aprobado. El usuario aprobó el modelo de datos y pidió construir el resto sin más preguntas.

## Decisiones

- **Infraestructura:** Vercel (Pro, porque es uso comercial) con el dominio de Imagmed, y Supabase como base de datos, auth y storage.
- **Cambios del admin:** se ven al instante.
- **Acceso:** con contraseña y 2FA (TOTP) obligatorio para todos, sin registro público.
  - **Equipo** (cambio del 2026-10-11): el super admin agrega miembros en `/admin/equipo` con correo y una contraseña que él asigna.
  - **Roles:** `super` (además gestiona el equipo) y `miembro` (edita el contenido).
  - **Edge Function `equipo`:** crea, quita y resetea miembros. La llave secreta nunca sale de Supabase.
- **Catálogo general:** un producto es cualquier equipo, con su categoría y su marca. Los ultrasonidos son una categoría más.
- **Hero:**
  - Por defecto se ve el diseño actual, con los productos que elija el admin (cambio del 2026-10-16: hasta 5, que rotan cada 6 s en el orden elegido).
  - Una campaña programada por fechas reemplaza **solo el visual** con una imagen estática 4:3 (1600×1200). Etiqueta, título, texto y botones siguen siendo HTML y se pueden editar en cada campaña.
- **Vista previa:** de la landing en una fecha (para campañas y descuentos programados) y de productos ocultos en su ficha real.
- **Fuera de alcance:**
  - Bandeja de leads. El formulario se conectará a Resend más adelante.
  - Bitácora de cambios.
  - Borradores de productos ya publicados.

## 1. Arquitectura

- Astro 7 con `output: 'server'`, `@astrojs/vercel` (`imageService: true`) y el route caching de Astro con `cacheVercel()`.
- **Páginas públicas** (`/`, `/equipos/[slug]`, `/productos/[slug]`, `/sitemap.xml`):
  - Leen Supabase con un cliente **sin cookies** que usa la publishable key.
  - Se guardan en el CDN con el tag `sitio`.
  - `maxAge` = segundos hasta el próximo inicio o fin de una campaña o descuento, con un tope de 24 h. Así lo programado entra a su hora sin cron.
- **Al guardar algo**, el admin hace `cache.invalidate({ tags: ['sitio'] })`. La invalidación es suave: la siguiente visita regenera la página en segundo plano.
- **Carga de datos:** `src/lib/sitio.ts` carga todo una vez por request y lo deja en `Astro.locals.sitio`. Los componentes lo leen de ahí en lugar de importar `src/data/*`.
- **Admin** (`/admin/*`):
  - Páginas SSR con formularios HTML normales que se procesan en la misma página: POST → redirect.
  - Nunca se guarda en caché.
  - La vista previa vive bajo `/admin`, así nunca pasa por la caché pública.

## 2. Modelo de datos (Supabase)

El esquema vive en `src/db/esquema.ts`, escrito con Drizzle: tablas, checks, FKs, índices y políticas RLS. `drizzle-kit` genera las migraciones en `supabase/migrations` con prefijo `supabase` y `pnpm db:migrar` las aplica. Lo que Drizzle no expresa va en dos migraciones SQL propias:

- `privado`: la función `es_admin`.
- `extras`: `EXCLUDE`, la fila de ajustes, los `GRANT` y Storage.

**En runtime no se usa Drizzle.** Las consultas siguen por la API de Supabase con RLS, así que Vercel solo guarda la publishable key; del esquema solo se toman los tipos de fila (`$inferSelect`). Lo decidió el usuario el 2026-10-10 para mantener la seguridad.

| Tabla | Campos |
| --- | --- |
| `categorias` | slug, nombre, descripción, orden, visible |
| `marcas` | nombre, logo (`{ruta, ancho, alto}`), orden |
| `productos` | slug, nombre, `tipo` (etiqueta corta, p. ej. «Ultrasonido Portátil»), categoría, marca (opcional), subtítulo, descripción, imagen + alt, especificaciones/especialidades/incluye (`text[]`), tecnologías, especificaciones detalladas, accesorios (`jsonb`), `accesorios_titulo`, estado (`publicado`, `agotado`, `oculto`), destacado, orden, descuento (texto, inicio, fin) |
| `campanas` | nombre interno, inicio, fin, etiqueta, título, texto, textos de los 2 botones, imagen + alt, producto opcional (para preseleccionarlo en el formulario). Una restricción `EXCLUDE` impide que dos campañas se encimen. |
| `ajustes` | Una sola fila. Hero por defecto (productos que rotan, etiqueta, título, texto, rótulo de accesorios) y contacto (WhatsApp, mensaje, teléfono, aviso de privacidad, dirección, horario, link de Google Maps). |
| `faq` | pregunta, respuesta, orden |
| `administradores` | `user_id`. Solo `service_role` puede leerla. |

**Reglas:**
- **Estados de producto:**
  - **Agotado:** se ve con la etiqueta «Agotado» y su botón dice «Consultar disponibilidad».
  - **Oculto:** desaparece de todo el sitio y su ficha da 404.
- **Descuento:** se ve si tiene texto y la fecha actual está dentro del rango. Las fechas son opcionales.
- **Hora:** las fechas se capturan en hora del centro de México (UTC−6, sin horario de verano desde 2022).
- **Imágenes:** van al bucket público `imagenes`, con un máximo de 4 MB por archivo (el límite de body de Vercel es 4.5 MB). Solo se aceptan PNG, JPEG, WebP y AVIF, y se validan con `sharp`.
- **Se queda en el código:** los textos de UI, las coordenadas del mapa y el `endpoint` del formulario.

## 3. Seguridad

- **Login:** Supabase Auth con correo y contraseña. **Signups deshabilitados** en el dashboard.
- **2FA obligatorio:**
  - Si la cuenta no tiene factor, el primer login obliga a registrarlo con un QR.
  - Una vez registrado, Supabase exige AAL2 para registrar otro factor. Quien solo tenga la contraseña no puede agregar su propio autenticador.
- **Middleware en `/admin/*`:** valida el JWT con `getClaims()`. Para dejar pasar exige:
  - `aal = aal2`;
  - una sesión de menos de 8 h (según el `amr` de la contraseña);
  - que el usuario esté en `administradores` (RPC `es_admin`).

  Las respuestas llevan `Cache-Control: no-store`, `X-Robots-Tag: noindex`, `X-Frame-Options: DENY` y `Referrer-Policy: same-origin`.
- **Cookies de sesión:** `httpOnly`, `secure` y `sameSite=lax`. Nunca se usa un cliente de Supabase en el navegador.
- **CSRF:** `security.checkOrigin` de Astro, que viene activado por defecto.
- **RLS** en todas las tablas, con permisos explícitos:
  - `anon` solo puede leer lo público.
  - Toda escritura requiere `privado.es_admin()`: `aal2` y estar en `administradores`. Así, aunque alguien activara los signups por error, no podría escribir.
  - Storage aplica la misma regla.
- **Secret key:** solo se usa en scripts locales (semilla y administración de la cuenta). Nunca va en Vercel.
- **Fuerza bruta:** regla de rate limit en Vercel Firewall para `POST /admin/entrar` y `/admin/verificar`. Junto con la contraseña larga y el TOTP, cierra ese frente.

## 4. Sitio público

- **Hero:** muestra la campaña vigente y, si no hay, los productos elegidos, que rotan; cada uno con su marca de agua y los accesorios que tienen imagen. Los equipos altos (carros, rayos X móviles) se ven en acercamiento, solo su parte de arriba: la subida guarda la caja del equipo sin el fondo transparente (`imagen.contenido`). El volumen 3D va solo con el MX3, para el que se hizo.
- **Catálogo de la landing:** productos destacados y no ocultos, en el orden definido, con las etiquetas de descuento y «Agotado».
- **Páginas por categoría:** listan sus productos.
- **Ficha de producto:** textos genéricos (sin «Ultrasonido Mindray» fijo) y «otros equipos» de la misma categoría.
- **Menú, marcas, FAQ, contacto, footer, mapa, JSON-LD, sitemap y opciones del formulario:** salen de la base de datos.
- **robots.txt:** `Disallow: /admin`.

## Puesta en marcha (cuando lleguen las cuentas)

Ver `supabase/LEEME.md`.

## Pruebas

- `pnpm test`: reglas puras (vigencia, campaña activa, próximo cambio, formatos de texto y fechas).
- `node --env-file=.env scripts/verificar-rls.mjs`: contra el Supabase real, comprueba que `anon` no puede escribir ni ver productos ocultos.
- Manual en un deploy de preview de Vercel (la caché no funciona en dev): login + 2FA, CRUD, campaña con vista previa y que el cambio se refleje al guardar.
