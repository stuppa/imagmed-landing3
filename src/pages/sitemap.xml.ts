import type { APIRoute } from 'astro';
import { equipos } from '../data/equipos';
import { productos } from '../data/sitio';

// ponytail: lista de rutas a mano; si crecen las páginas, cambiar por @astrojs/sitemap.
const rutas = [
  '/',
  ...equipos.map((e) => `/equipos/${e.slug}`),
  ...productos.categorias.filter((c) => c.slug).map((c) => `/productos/${c.slug}`),
];

export const GET: APIRoute = ({ site }) =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutas.map((r) => `  <url><loc>${new URL(r, site)}</loc></url>`).join('\n')}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
