// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { cacheVercel } from '@astrojs/vercel/cache';

// Fontsource (@fontsource-variable/source-sans-3) servido localmente; solo el subconjunto latin.
const fuente = './node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght';

export default defineConfig({
  // TODO: confirmar con el cliente el dominio definitivo (se usa en canonical, Open Graph, sitemap y JSON-LD).
  site: 'https://www.example.com',
  // El contenido vive en Supabase: todo se renderiza en el servidor y lo público se guarda en el CDN de Vercel
  // (src/lib/sitio.ts), que el admin invalida al guardar.
  output: 'server',
  adapter: vercel({ imageService: true }),
  cache: { provider: cacheVercel() },
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: 'server', access: 'public', url: true }),
      SUPABASE_KEY: envField.string({ context: 'server', access: 'secret' }),
    },
  },
  image: {
    // Imágenes del bucket «imagenes» (proyecto en la nube o Supabase local).
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'http', hostname: '127.0.0.1', port: '54321' },
    ],
  },
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
  },
});
