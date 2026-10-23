import type { APIRoute } from 'astro';
import { prepararPagina } from '../lib/sitio';

// ponytail: lista de rutas a mano; si crecen las páginas, cambiar por @astrojs/sitemap.
export const GET: APIRoute = async (ctx) => {
  const { productos, categorias } = await prepararPagina(ctx);
  const rutas = [
    '/',
    '/productos',
    ...productos.map((p) => `/equipos/${p.slug}`),
    ...categorias.map((c) => `/productos/${c.slug}`),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutas.map((r) => `  <url><loc>${new URL(r, ctx.site)}</loc></url>`).join('\n')}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
