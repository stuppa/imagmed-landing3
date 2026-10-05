# Imagmed Nacional — landing

Landing estática de IMAGMED NACIONAL S.A. DE C.V. (equipos de ultrasonido Mindray).
Astro + TypeScript estricto + Tailwind CSS. Sin frameworks de UI.

## Comandos

```sh
pnpm install     # instala dependencias
pnpm dev         # servidor local en http://localhost:4321
pnpm build       # astro check + build estático en dist/
pnpm preview     # sirve dist/ localmente
```

Requiere Node 22.12 o superior y pnpm.

## Dónde editar

| Qué | Archivo |
| --- | --- |
| SEO, navegación, header, hero, footer, logo de Mindray | `src/data/sitio.ts` |
| Catálogo de equipos, fotos y transductores del hero | `src/data/equipos.ts` |
| Barra de confianza (frase, certificaciones, cifras) | `src/data/confianza.ts` |
| Calculadora de retorno (rangos, valores iniciales y textos del resultado) | `src/data/calculadora.ts` |
| Por qué Imagmed | `src/data/diferenciadores.ts` |
| Casos de éxito (la sección aparece al agregar el primero) | `src/data/casos.ts` |
| Proceso de compra | `src/data/pasos.ts` |
| Preguntas frecuentes | `src/data/faq.ts` |
| WhatsApp, teléfono, aviso de privacidad, endpoint y textos del formulario | `src/data/contacto.ts` |
| Colores de marca | `src/styles/global.css` (bloque `@theme`) |
| Dominio (canonical, Open Graph, sitemap) | `astro.config.mjs` → `site` |

- En los títulos, el texto entre `*asteriscos*` se muestra en itálica bold azul.
- Si un dato está vacío, su elemento no se muestra: los botones de WhatsApp aparecen al llenar el número,
  el teléfono y el aviso de privacidad al llenar sus campos, una pregunta frecuente al tener respuesta.
- Fotos de equipos: reemplaza los PNG de `src/assets/equipos/` conservando el nombre (o importa uno nuevo
  en `equipos.ts`). Astro genera AVIF/WebP en varios tamaños al compilar.
- Busca `TODO:` en `src/` y `astro.config.mjs` para ver los datos pendientes de confirmar.

## Formulario

Envía por `POST` (`multipart/form-data`) a `contacto.endpoint` con los campos `nombre`, `telefono`, `correo`,
`equipo`, `cuando`, `solicitud` (Cotización o Demo), `proyeccion` (resumen de la calculadora, si lo adjuntó)
y `sitio_web` (trampa para bots, siempre vacío en envíos reales). Se considera exitoso cualquier
respuesta 2xx; funciona con servicios tipo Formspree o con un endpoint propio.
