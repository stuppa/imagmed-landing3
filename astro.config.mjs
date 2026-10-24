// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { cacheVercel } from '@astrojs/vercel/cache';

// Fontsource (@fontsource-variable/source-sans-3) servido localmente; solo el subconjunto latin.
const fuente = './node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght';

// Imágenes del bucket «imagenes» (proyecto en la nube o Supabase local).
/** @type {{ protocol: 'http' | 'https'; hostname: string; port?: string }[]} */
const remotePatterns = [
  { protocol: 'https', hostname: '**.supabase.co' },
  { protocol: 'http', hostname: '127.0.0.1', port: '54321' },
];

export default defineConfig({
  // Se usa en canonical, Open Graph (lo que comparten Chrome y Safari), sitemap y JSON-LD. Vercel da el dominio de
  // producción al compilar: el .vercel.app y, cuando se conecte, el de Imagmed (hay que volver a desplegar).
  site: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321',
  // El contenido vive en Supabase: todo se renderiza en el servidor y lo público se guarda en el CDN de Vercel
  // (src/lib/sitio.ts), que el admin invalida al guardar.
  output: 'server',
  adapter: vercel({
    imageService: true,
    // Por defecto el optimizador de Vercel solo acepta anchos desde 640 px (los círculos de 48 px bajaban 640) y solo
    // entrega WebP. Cada `widths` del sitio debe salir de esta lista: el adaptador descarta los que no están.
    // Sin `quality` el adaptador pide calidad 100 (el doble de peso): fotos con 80, logos con 90.
    // Reemplaza la configuración de `image`, por eso repite los remotePatterns.
    imagesConfig: {
      sizes: [96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920],
      formats: ['image/avif', 'image/webp'],
      remotePatterns,
    },
  }),
  cache: { provider: cacheVercel() },
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: 'server', access: 'public', url: true }),
      SUPABASE_KEY: envField.string({ context: 'server', access: 'secret' }),
      // Opcional: sin ella el sitio compila y solo el formulario falla (src/pages/api/cotizacion.ts).
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  image: { remotePatterns },
  build: {
    // Una sola página: el CSS en línea evita una petición que bloquea el render (mejor LCP).
    inlineStylesheets: 'always',
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Source Sans 3',
      cssVariable: '--font-source-sans',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          { src: [`${fuente}-normal.woff2`], weight: '200 900', style: 'normal' },
          { src: [`${fuente}-italic.woff2`], weight: '200 900', style: 'italic' },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // El CSS en línea sale del build del servidor, cuyo target no es un navegador: Lightning CSS minifica sin
      // objetivos y mete animation-timeline dentro del shorthand animation, que Chrome y Safari descartan
      // (adiós animaciones con scroll en producción). Con los objetivos de navegador de Vite lo deja aparte.
      cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'],
    },
  },
});
