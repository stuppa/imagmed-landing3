// pnpm test — reglas puras del contenido (sin Supabase ni Astro).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  aFechaLocal,
  campanaActiva,
  deFechaLocal,
  encuadreHero,
  grupos,
  gruposATexto,
  lineas,
  pares,
  paresATexto,
  productosHero,
  segundosHastaProximoCambio,
  slugificar,
  vigente,
} from './contenido.ts';

const d = (iso: string) => new Date(iso);
const ahora = d('2026-11-13T12:00:00Z');

test('vigente: sin fechas siempre; con fechas, inicio incluido y fin excluido', () => {
  assert.equal(vigente({ inicio: null, fin: null }, ahora), true);
  assert.equal(vigente({ inicio: ahora, fin: null }, ahora), true);
  assert.equal(vigente({ inicio: null, fin: ahora }, ahora), false);
  assert.equal(vigente({ inicio: d('2026-11-14T00:00:00Z'), fin: null }, ahora), false);
  assert.equal(vigente({ inicio: d('2026-11-01T00:00:00Z'), fin: d('2026-11-30T00:00:00Z') }, ahora), true);
});

test('campanaActiva: devuelve la que cubre el momento o undefined', () => {
  const pasada = { id: 'a', inicio: d('2026-10-01T00:00:00Z'), fin: d('2026-10-31T00:00:00Z') };
  const actual = { id: 'b', inicio: d('2026-11-10T00:00:00Z'), fin: d('2026-11-20T00:00:00Z') };
  const futura = { id: 'c', inicio: d('2026-12-01T00:00:00Z'), fin: d('2026-12-25T00:00:00Z') };
  assert.equal(campanaActiva([pasada, actual, futura], ahora)?.id, 'b');
  assert.equal(campanaActiva([pasada, futura], ahora), undefined);
});

test('productosHero: los elegidos en su orden, sin los que ya no se muestran; sin elección, el primer destacado', () => {
  const lista = [
    { id: 'a', destacado: false },
    { id: 'b', destacado: true },
    { id: 'c', destacado: true },
  ];
  const ids = (l: { id: string }[]) => l.map((p) => p.id);
  assert.deepEqual(ids(productosHero(['c', 'borrado', 'a'], lista)), ['c', 'a']);
  assert.deepEqual(ids(productosHero([], lista)), ['b']);
  assert.deepEqual(ids(productosHero(['borrado'], [{ id: 'a', destacado: false }])), ['a']);
  assert.deepEqual(productosHero([], []), []);
});

test('encuadreHero: un equipo alto se recorta a su parte de arriba en 4:3; uno ancho o sin caja va completo', () => {
  // Carro de 500×1000 dentro de un lienzo transparente: ventana de 600×450 centrada y un poco arriba de él.
  assert.deepEqual(encuadreHero({ x: 300, y: 100, ancho: 500, alto: 1000 }), { x: 250, y: 82, ancho: 600, alto: 450 });
  assert.equal(encuadreHero({ x: 0, y: 0, ancho: 1385, alto: 1149 }), null); // portátil tipo laptop
  assert.equal(encuadreHero(undefined), null);
});

test('segundosHastaProximoCambio: la fecha futura más cercana, entre 1 s y el tope', () => {
  const en90s = new Date(ahora.getTime() + 90_000);
  const en2h = new Date(ahora.getTime() + 7_200_000);
  assert.equal(segundosHastaProximoCambio([null, d('2026-01-01T00:00:00Z'), en2h, en90s], ahora), 90);
  assert.equal(segundosHastaProximoCambio([], ahora), 86_400);
  assert.equal(segundosHastaProximoCambio([en2h], ahora, 60), 60);
  assert.equal(segundosHastaProximoCambio([new Date(ahora.getTime() + 200)], ahora), 1);
});

test('lineas: una por renglón, sin vacías ni espacios sobrantes', () => {
  assert.deepEqual(lineas('  uno \n\n dos\r\n'), ['uno', 'dos']);
  assert.deepEqual(lineas(''), []);
});

test('pares: «Título: descripción», el valor puede llevar dos puntos; ida y vuelta', () => {
  const lista = pares('ZST+: Adquisición por zonas\nHora: 10:30 hrs\nSolo título');
  assert.deepEqual(lista, [
    { titulo: 'ZST+', descripcion: 'Adquisición por zonas' },
    { titulo: 'Hora', descripcion: '10:30 hrs' },
    { titulo: 'Solo título', descripcion: '' },
  ]);
  assert.deepEqual(pares(paresATexto(lista)), lista);
});

test('grupos: «# Grupo» abre grupo y «Etiqueta: valor» agrega renglón; ida y vuelta', () => {
  const texto = 'Monitor: 15.6"\n# Conectividad\nDICOM: 3.0\nSalidas: HDMI, USB 3.0';
  const lista = grupos(texto);
  assert.deepEqual(lista, [
    { categoria: 'Especificaciones', items: [{ etiqueta: 'Monitor', valor: '15.6"' }] },
    {
      categoria: 'Conectividad',
      items: [
        { etiqueta: 'DICOM', valor: '3.0' },
        { etiqueta: 'Salidas', valor: 'HDMI, USB 3.0' },
      ],
    },
  ]);
  assert.deepEqual(grupos(gruposATexto(lista)), lista);
});

test('fechas: datetime-local en hora del centro de México (UTC-6) ida y vuelta', () => {
  assert.equal(deFechaLocal('2026-11-13T00:00')?.toISOString(), '2026-11-13T06:00:00.000Z');
  assert.equal(deFechaLocal(''), null);
  assert.equal(deFechaLocal('no es fecha'), null);
  assert.equal(aFechaLocal('2026-11-13T06:00:00.000Z'), '2026-11-13T00:00');
  assert.equal(aFechaLocal(null), '');
});

test('slugificar: minúsculas, sin acentos ni símbolos', () => {
  assert.equal(slugificar('  Arcos en C — Ñandú Ultrasonido 4D! '), 'arcos-en-c-nandu-ultrasonido-4d');
});
