import type { APIRoute } from 'astro';
import { RESEND_API_KEY } from 'astro:env/server';
import { correoVentas, remitenteFormulario } from '../../data/contacto';
import { htmlCotizacion } from '../../emails/Cotizacion';
import { ORIGEN, armarCorreo } from '../../lib/cotizacion';
import { clientePublico, urlImagen } from '../../lib/supabase';
import type { Imagen } from '../../db/esquema';

// Recibe el formulario de contacto y lo manda por Resend a ventas. Sin la llave responde error y el formulario ofrece
// WhatsApp. ponytail: sin límite de envíos; si llega spam, una regla de rate limit en el Firewall de Vercel.
export const POST: APIRoute = async ({ request }) => {
  const f = await request.formData();
  const correo = armarCorreo(f, await fotoEquipo(String(f.get('equipo') ?? '')));
  if (correo === 'bot') return Response.json({ ok: true });
  if (correo === 'invalido') return Response.json({ ok: false }, { status: 400 });

  if (!RESEND_API_KEY) {
    console.error('Falta RESEND_API_KEY: el formulario no puede enviar correos.');
    return Response.json({ ok: false }, { status: 500 });
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: remitenteFormulario,
      to: [correoVentas],
      reply_to: correo.responderA,
      subject: correo.asunto,
      text: correo.texto,
      html: await htmlCotizacion(correo.datos),
    }),
  });
  if (!r.ok) {
    console.error(`Resend respondió ${r.status}: ${await r.text()}`);
    return Response.json({ ok: false }, { status: 502 });
  }
  return Response.json({ ok: true });
};

// Foto del equipo elegido, pasada por el optimizador de Vercel (PNG de ~60 KB para los correos que no aceptan AVIF/WebP).
// Categorías, servicio o «aún no lo sé» no tienen foto; si Supabase falla, el correo sale sin ella.
async function fotoEquipo(equipo: string) {
  const { data } = await clientePublico()
    .from('productos')
    .select('nombre, imagen, marcas(nombre)')
    .neq('estado', 'oculto')
    .then((r) => r, () => ({ data: null }));
  const p = (data as { nombre: string; imagen: Imagen; marcas: { nombre: string } | null }[] | null)?.find(
    (p) => (p.marcas ? `${p.marcas.nombre} ${p.nombre}` : p.nombre) === equipo,
  );
  return p && `${ORIGEN}/_vercel/image?url=${encodeURIComponent(urlImagen(p.imagen.ruta))}&w=640&q=80`;
}
