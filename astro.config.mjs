// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Fontsource (@fontsource-variable/source-sans-3) servido localmente; solo el subconjunto latin.
const fuente = './node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght';

export default defineConfig({
  // TODO: confirmar con el cliente el dominio definitivo (se usa en canonical, Open Graph, sitemap y JSON-LD).
  site: 'https://www.example.com',
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
