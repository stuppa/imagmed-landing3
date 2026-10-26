// Formulario de contacto → correo para ventas. Repite las reglas del navegador: cualquiera puede mandar el POST directo.
import { formulario } from '../data/contacto.ts';

const MAXIMOS = { nombre: 120, telefono: 30, correo: 200, equipo: 200, cuando: 100, solicitud: 40, proyeccion: 1000 };
type Campo = keyof typeof MAXIMOS;

// Los correos necesitan URLs absolutas: el logo (public/) y la foto del equipo salen del sitio en producción.
export const ORIGEN = 'https://imagmed.com';
const LOGO = `${ORIGEN}/logo-correo.png`;

export interface Correo {
  asunto: string;
  texto: string;
  html: string;
  responderA: string;
}

/**
 * `bot`: llenó la trampa (se le responde que sí, pero no se envía). `invalido`: falta un dato o no tiene forma.
 * `foto`: URL de la foto del equipo, si eligió uno del catálogo.
 */
export function armarCorreo(f: FormData, foto?: string, ahora = new Date()): Correo | 'bot' | 'invalido' {
  if (f.get('sitio_web')) return 'bot';
  const d = {} as Record<Campo, string>;
  for (const k of Object.keys(MAXIMOS) as Campo[]) {
    d[k] = String(f.get(k) ?? '').trim();
    if (d[k].length > MAXIMOS[k]) return 'invalido';
  }
  const digitos = d.telefono.replace(/\D/g, '');
  if (
    d.nombre.length < 3 ||
    !/^[\d\s()+-]+$/.test(d.telefono) ||
    digitos.length < 10 ||
    digitos.length > 13 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo) ||
    !d.equipo ||
    !d.cuando
  ) {
    return 'invalido';
  }
  const solicitud = d.solicitud || 'Cotización';
  const proyeccion = d.proyeccion ? d.proyeccion.split('; ') : [];
  const unaLinea = (s: string) => s.replace(/\s+/g, ' ');
  const asunto = unaLinea(`${solicitud}: ${d.equipo} — ${d.nombre}`);
  const fecha = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(ahora);
  // 10 dígitos = número mexicano sin lada de país.
  const internacional = digitos.length === 10 ? `52${digitos}` : digitos;

  return {
    asunto,
    texto: [
      `Nueva solicitud desde el sitio web (${solicitud}).`,
      '',
      `Nombre: ${d.nombre}`,
      `Teléfono: ${d.telefono}`,
      `Correo: ${d.correo}`,
      `Equipo: ${d.equipo}`,
      `¿Cuándo lo necesita?: ${d.cuando}`,
      ...(proyeccion.length ? ['', 'Proyección de la calculadora:', ...proyeccion] : []),
      '',
      `Llegó el ${fecha} (hora del centro de México). Responde este correo para escribirle directo al cliente.`,
    ].join('\n'),
    html: html({
      ...d,
      asunto,
      solicitud,
      proyeccion,
      fecha,
      foto,
      urgente: d.cuando === formulario.cuando[0],
      mailto: `mailto:${d.correo}?subject=${encodeURIComponent(`${solicitud} de ${d.equipo} — IMAGMED NACIONAL`)}`,
      whatsapp: `https://wa.me/${internacional}`,
      tel: `tel:+${internacional}`,
    }),
    responderA: d.correo,
  };
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Mismo lenguaje que la página (src/styles/global.css): fondo negro, etiquetas espaciadas, título delgado con una palabra
// en cursiva azul, botones cuadrados y el equipo sobre un resplandor azul como en el hero. Tablas y estilos en línea: es lo
// que respetan Outlook, Gmail y Zoho; el <style> solo acomoda el celular donde se soporta, y los degradados son extra.
const NEGRO = '#03060D';
const NOCHE = '#071226';
const MARCA = '#0066DD';
const MARCA_CLARO = '#4D94E7';
const SUAVE = '#9AA4B5';
const LINEA = '#1C2638';
const FUENTE = "'Source Sans 3','Segoe UI',Helvetica,Arial,sans-serif";

function html(c: {
  asunto: string;
  solicitud: string;
  nombre: string;
  telefono: string;
  correo: string;
  equipo: string;
  cuando: string;
  proyeccion: string[];
  fecha: string;
  foto?: string;
  urgente: boolean;
  mailto: string;
  whatsapp: string;
  tel: string;
}) {
  const etiqueta = (texto: string, color = SUAVE) =>
    `<p style="margin:0;color:${color};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">${texto}</p>`;
  const boton = (href: string, texto: string, principal = false) =>
    `<a class="boton" href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:15px 24px;border:1px solid ${principal ? MARCA : '#3A4558'};background:${principal ? MARCA : NEGRO};color:#ffffff;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none">${texto}</a>`;
  const dato = (titulo: string, valor: string, segunda = false) =>
    `<td class="col${segunda ? ' col2' : ''}" width="50%" style="width:50%;padding:18px 24px;border-top:1px solid ${LINEA};${segunda ? `border-left:1px solid ${LINEA};` : ''}vertical-align:top">${etiqueta(titulo)}<p style="margin:6px 0 0;color:#ffffff;font-size:17px;font-weight:600;word-break:break-word">${valor}</p></td>`;
  const enlace = (href: string, texto: string) =>
    `<a href="${esc(href)}" style="color:#ffffff;text-decoration:none">${esc(texto)}</a>`;
  const resplandor = `background-color:${NOCHE};background-image:radial-gradient(ellipse at center,rgba(0,102,221,0.45) 0%,rgba(7,18,38,0) 62%)`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,700&display=swap" rel="stylesheet">
<title>${esc(c.asunto)}</title>
<style>
@media (max-width:520px){
.col{display:block!important;width:auto!important}
.col2{border-left:0!important}
.boton{display:block!important;margin:0 0 8px!important;text-align:center!important}
.titulo{font-size:30px!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:${NEGRO}">
<div style="display:none;max-height:0;overflow:hidden">${esc(`${c.equipo} · ${c.nombre} · ${c.cuando}`)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NEGRO}">
<tr><td align="center" style="padding:0 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;font-family:${FUENTE};color:#ffffff">
<tr><td style="padding:32px 0 24px;border-bottom:1px solid ${LINEA}">
<img src="${LOGO}" width="140" height="32" alt="IMAGMED" style="display:block;border:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:2px">
</td></tr>
<tr><td style="padding:40px 0 0">
${etiqueta(`Formulario del sitio${c.urgente ? `&nbsp;&nbsp;<span style="display:inline-block;padding:3px 8px;background:${MARCA};color:#ffffff;letter-spacing:1.5px">Urgente</span>` : ''}`, MARCA_CLARO)}
<h1 class="titulo" style="margin:16px 0 0;color:#ffffff;font-size:40px;font-weight:300;line-height:1.1;letter-spacing:-0.5px">Nueva solicitud de <em style="color:${MARCA_CLARO};font-weight:700">${esc(c.solicitud.toLowerCase())}</em>.</h1>
<p style="margin:16px 0 0;color:${SUAVE};font-size:17px;line-height:1.5"><span style="color:#ffffff;font-weight:600">${esc(c.nombre)}</span> la envió el ${esc(c.fecha)} (hora del centro de México).</p>
</td></tr>
<tr><td style="padding:28px 0 0">
${boton(c.mailto, 'Responder por correo', true)}${boton(c.whatsapp, 'WhatsApp')}${boton(c.tel, 'Llamar')}
</td></tr>
<tr><td style="padding:28px 0 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NOCHE};border:1px solid ${LINEA};border-top:3px solid ${MARCA}">
${
  c.foto
    ? `<tr><td colspan="2" align="center" style="padding:28px 24px 8px;${resplandor}"><img src="${esc(c.foto)}" width="240" height="240" alt="${esc(c.equipo)}" style="display:block;width:240px;height:240px;border:0"></td></tr>`
    : ''
}
<tr><td colspan="2" style="padding:${c.foto ? '12px' : '24px'} 24px 22px;text-align:${c.foto ? 'center' : 'left'}">${etiqueta('Equipo')}<p style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.2">${esc(c.equipo)}</p></td></tr>
<tr>${dato('Cliente', esc(c.nombre))}${dato('¿Cuándo lo necesita?', esc(c.cuando), true)}</tr>
<tr>${dato('Teléfono', enlace(c.tel, c.telefono))}${dato('Correo', enlace(c.mailto, c.correo), true)}</tr>
</table>
</td></tr>
${
  c.proyeccion.length
    ? `<tr><td style="padding:16px 0 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NOCHE};border:1px solid ${LINEA};border-left:3px solid ${MARCA}"><tr><td style="padding:20px 24px">${etiqueta('Proyección de la calculadora', MARCA_CLARO)}${c.proyeccion.map((l) => `<p style="margin:8px 0 0;color:#ffffff;font-size:15px">${esc(l)}</p>`).join('')}</td></tr></table></td></tr>`
    : ''
}
<tr><td style="padding:36px 0 40px">
<p style="margin:0;padding-top:24px;border-top:1px solid ${LINEA};color:${SUAVE};font-size:13px;line-height:1.6">Responde este correo para escribirle directo al cliente.<br><span style="letter-spacing:2px;text-transform:uppercase">IMAGMED Nacional</span> · <a href="${ORIGEN}" style="color:${SUAVE}">imagmed.com</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
