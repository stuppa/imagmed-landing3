// pnpm test — el correo que arma el formulario de contacto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { armarCorreo } from './cotizacion.ts';

const form = (cambios: Record<string, string> = {}) => {
  const f = new FormData();
  const datos = {
    nombre: 'Ana López',
    telefono: '271 190 6286',
    correo: 'ana@clinica.com',
    equipo: 'Mindray Resona I9',
    cuando: 'Lo antes posible',
    solicitud: 'Cotización',
    proyeccion: '',
    sitio_web: '',
    ...cambios,
  };
  for (const [k, v] of Object.entries(datos)) f.set(k, v);
  return f;
};

test('arma el correo con los datos y responde al cliente', () => {
  const c = armarCorreo(form({ proyeccion: 'Estudios al día: 10; Meses para recuperar: 14' }));
  assert.ok(typeof c === 'object');
  assert.equal(c.asunto, 'Cotización: Mindray Resona I9 — Ana López');
  assert.equal(c.responderA, 'ana@clinica.com');
  assert.match(c.texto, /Teléfono: 271 190 6286/);
  assert.match(c.texto, /\nEstudios al día: 10\nMeses para recuperar: 14\n/);
});

test('la trampa llena es un bot', () => {
  assert.equal(armarCorreo(form({ sitio_web: 'http://spam' })), 'bot');
});

test('rechaza datos faltantes o sin forma', () => {
  for (const cambio of [
    { nombre: 'Al' },
    { telefono: '12345' },
    { telefono: '271-190-6286 ext' },
    { correo: 'ana@clinica' },
    { equipo: '' },
    { cuando: '  ' },
    { nombre: 'x'.repeat(121) },
  ] as Record<string, string>[]) {
    assert.equal(armarCorreo(form(cambio)), 'invalido', JSON.stringify(cambio));
  }
});

test('prepara los enlaces para responder, abrir WhatsApp o llamar', () => {
  const c = armarCorreo(form({ telefono: '(271) 190-6286', cuando: 'Lo antes posible' }));
  assert.ok(typeof c === 'object');
  assert.equal(c.datos.whatsapp, 'https://wa.me/522711906286');
  assert.equal(c.datos.tel, 'tel:+522711906286');
  assert.match(c.datos.mailto, /^mailto:ana@clinica\.com\?subject=/);
  assert.equal(c.datos.urgente, true);
});

test('el asunto queda en una línea', () => {
  const c = armarCorreo(form({ nombre: 'Ana\r\nBcc: otro@x.com' }));
  assert.ok(typeof c === 'object');
  assert.doesNotMatch(c.asunto, /[\r\n]/);
});
