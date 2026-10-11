# Imagmed Nacional — landing

Landing de IMAGMED NACIONAL S.A. DE C.V. (equipos de ultrasonido Mindray) con panel admin en `/admin`.
Astro (SSR en Vercel, con caché en el CDN) + Supabase + Drizzle (esquema y migraciones) + TypeScript estricto +
Tailwind CSS. Sin frameworks de UI.

## Comandos

```sh
pnpm install     # instala dependencias
pnpm dev         # servidor local en http://localhost:4321 (requiere .env, ver .env.example)
pnpm test        # pruebas de las reglas de contenido (fechas, campañas, formatos)
pnpm build       # astro check + build para Vercel
pnpm db:generar  # genera la migración tras editar src/db/esquema.ts (Drizzle)
pnpm db:migrar   # aplica las migraciones pendientes a Supabase (usa SUPABASE_DB_URL)
```

Requiere Node 22.12 o superior y pnpm. La puesta en marcha de Supabase y Vercel (cuentas, migración,
contenido inicial, cuenta admin) está en [`supabase/LEEME.md`](supabase/LEEME.md).

## Panel admin (`/admin`)

Una sola cuenta, con contraseña y verificación en dos pasos (app autenticadora). Desde ahí se edita:

- **Productos**: alta, edición y baja; estado publicado / agotado (etiqueta) / oculto; destacado en la landing;
  orden; etiqueta de descuento con fechas; fotos, ficha técnica y accesorios.
- **Categorías** del menú «Productos» y **marcas** (con logo).
- **Hero**: producto y textos por defecto, y **campañas** por fechas con imagen estática 4:3.
- **Contacto y FAQ**: WhatsApp, teléfono, aviso de privacidad, dirección, horario y preguntas frecuentes.
- **Vista previa** de la landing en cualquier fecha y de productos ocultos.

Los cambios se ven en segundos: al guardar se invalida la caché del CDN. El diseño está en
`docs/superpowers/specs/2026-10-09-panel-admin-design.md`.

## Dónde editar (código)

| Qué | Archivo |
| --- | --- |
| SEO, navegación, textos del header, catálogo y footer, logo de Mindray | `src/data/sitio.ts` |
| Barra de confianza (frase, certificaciones, cifras) | `src/data/confianza.ts` |
| Calculadora de retorno (rangos, valores iniciales y textos del resultado) | `src/data/calculadora.ts` |
| Por qué Imagmed | `src/data/diferenciadores.ts` |
| Casos de éxito (la sección aparece al agregar el primero) | `src/data/casos.ts` |
| Proceso de compra | `src/data/pasos.ts` |
| Textos de la sección FAQ (las preguntas, en el admin) | `src/data/faq.ts` |
| Endpoint y textos del formulario (los datos de contacto, en el admin) | `src/data/contacto.ts` |
| Colores de marca | `src/styles/global.css` (bloque `@theme`) |
| Dominio (canonical, Open Graph, sitemap) | `astro.config.mjs` → `site` |

- En los títulos, el texto entre `*asteriscos*` se muestra en itálica bold azul.
- Si un dato está vacío, su elemento no se muestra: los botones de WhatsApp aparecen al llenar el número,
  el teléfono y el aviso de privacidad al llenar sus campos, una pregunta frecuente al tener respuesta.
- Las fotos se suben desde el admin (Supabase Storage); Vercel las sirve optimizadas en AVIF/WebP.
- Busca `TODO:` en `src/` y `astro.config.mjs` para ver los datos pendientes de confirmar.

## Formulario

Envía por `POST` (`multipart/form-data`) a `endpointFormulario` (`src/data/contacto.ts`) con los campos `nombre`, `telefono`, `correo`,
`equipo`, `cuando`, `solicitud` (Cotización o Demo), `proyeccion` (resumen de la calculadora, si lo adjuntó)
y `sitio_web` (trampa para bots, siempre vacío en envíos reales). Se considera exitoso cualquier
respuesta 2xx; funciona con servicios tipo Formspree o con un endpoint propio.
