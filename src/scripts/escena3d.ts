// Montaje común de las escenas Three.js: carga perezosa después del LCP, tamaño, pausa fuera de pantalla,
// puntero, scroll y movimiento reducido. Si no hay WebGL 2 o falla la carga, no hace nada y queda el respaldo HTML/CSS.
import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export interface Estado {
  /** Segundos de animación acumulados (no avanza mientras la escena está pausada). */
  t: number;
  dt: number;
  /** Puntero relativo al contenedor, suavizado: -1 izquierda/arriba … 1 derecha/abajo. 0 sin mouse. */
  puntero: { x: number; y: number };
  /** 0 cuando el contenedor asoma por abajo de la pantalla, 1 cuando termina de salir por arriba. */
  scroll: number;
  ancho: number;
  alto: number;
  /** false con prefers-reduced-motion: la escena se pinta una vez, quieta. */
  movimiento: boolean;
}

export interface Escena {
  scene: Scene;
  camera: PerspectiveCamera;
  /** Devuelve false cuando ya no anima por sí sola: entonces solo se repinta si cambian puntero, scroll o tamaño. */
  actualizar?: (e: Estado) => boolean | void;
  redimensionar?: (ancho: number, alto: number) => void;
}

export type CrearEscena = (renderer: WebGLRenderer, contenedor: HTMLElement) => Escena | Promise<Escena>;

const cargada = new Promise<void>((listo) => {
  if (document.readyState === 'complete') listo();
  else addEventListener('load', () => listo(), { once: true });
});
const limitar = (v: number) => Math.min(1, Math.max(-1, v));

/** El canvas se agrega al final de `contenedor` (que define tamaño y posición) y recibe la clase `con-3d` al pintar. */
export function montar3d(contenedor: HTMLElement, cargar: () => Promise<{ crear: CrearEscena }>) {
  const estado: Estado = {
    t: 0,
    dt: 0,
    puntero: { x: 0, y: 0 },
    scroll: 0,
    ancho: 1,
    alto: 1,
    movimiento: !matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
  let escena: Escena | undefined;
  let renderer: WebGLRenderer | undefined;
  let visible = false;
  let iniciado = false;
  let cuadro = 0;
  let anterior = 0;
  let cursor: { x: number; y: number } | undefined;
  let ultimo = '';

  // Medidas del contenedor en el documento (se recalculan solo en resize o scroll)
  let rectTopDoc = 0;
  let rectLeftDoc = 0;
  let rectWidth = 1;
  let rectHeight = 1;
  let winScrollY = window.scrollY;
  let winScrollX = window.scrollX;
  let winHeight = window.innerHeight;

  const medirLayout = () => {
    winScrollY = window.scrollY;
    winScrollX = window.scrollX;
    winHeight = window.innerHeight;
    const r = contenedor.getBoundingClientRect();
    rectTopDoc = r.top + winScrollY;
    rectLeftDoc = r.left + winScrollX;
    rectWidth = r.width || 1;
    rectHeight = r.height || 1;
  };

  const actualizarScrollEstado = () => {
    const rTop = rectTopDoc - winScrollY;
    estado.scroll = Math.min(1, Math.max(0, (winHeight - rTop) / (winHeight + rectHeight)));
  };

  const pintar = () => escena && renderer?.render(escena.scene, escena.camera);

  const bucle = (ahora: number) => {
    cuadro = requestAnimationFrame(bucle);
    estado.dt = Math.min(0.05, (ahora - anterior) / 1000);
    anterior = ahora;
    estado.t += estado.dt;

    actualizarScrollEstado();

    const rTop = rectTopDoc - winScrollY;
    const rLeft = rectLeftDoc - winScrollX;

    const objetivo = cursor
      ? {
          x: limitar(((cursor.x - rLeft) / rectWidth) * 2 - 1),
          y: limitar(((cursor.y - rTop) / rectHeight) * 2 - 1),
        }
      : { x: 0, y: 0 };

    const k = 1 - Math.exp(-estado.dt * 5);
    estado.puntero.x += (objetivo.x - estado.puntero.x) * k;
    estado.puntero.y += (objetivo.y - estado.puntero.y) * k;
    const anima = escena?.actualizar?.(estado);

    // Escena en reposo: no repinta mientras puntero y scroll no cambien (ahorra GPU y batería).
    const huella = `${estado.puntero.x.toFixed(4)},${estado.puntero.y.toFixed(4)},${estado.scroll.toFixed(4)}`;
    if (anima === false && huella === ultimo) return;
    ultimo = huella;
    pintar();
  };

  const onWindowScroll = () => {
    winScrollY = window.scrollY;
    winScrollX = window.scrollX;
    winHeight = window.innerHeight;
    if (visible && estado.movimiento) sincronizar();
  };

  // Solo corre mientras se ve, la pestaña está activa y hay movimiento permitido.
  const sincronizar = () => {
    const correr = !!escena && visible && estado.movimiento && !document.hidden;
    if (correr && !cuadro) {
      anterior = performance.now();
      cuadro = requestAnimationFrame(bucle);
    } else if (!correr && cuadro) {
      cancelAnimationFrame(cuadro);
      cuadro = 0;
    }
  };

  const ro = new ResizeObserver(([e]) => {
    medirLayout();
    const { width, height } = e!.contentRect;
    if (!escena || !renderer || !width || !height) return;
    estado.ancho = width;
    estado.alto = height;
    renderer.setSize(width, height, false);
    escena.camera.aspect = width / height;
    escena.camera.updateProjectionMatrix();
    escena.redimensionar?.(width, height);
    ultimo = '';
    if (!cuadro) {
      actualizarScrollEstado();
      escena.actualizar?.(estado);
      pintar();
    }
  });

  const iniciar = async () => {
    try {
      const [{ WebGLRenderer }, { crear }] = await Promise.all([import('three'), cargar()]);
      renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        precision: 'highp',
      });
      // Limitar a DPR 1.75 máx para pantallas 3K/4K sin pérdida visual perceptible pero ganando un 40% de tasa de refresco.
      // En pantallas táctiles (celular y tablet) basta 1.25: la mitad de pixeles que pintar, menos batería y calor.
      // El antialias se queda: en GPUs móviles casi no cuesta y sin él el transductor se ve dentado.
      const tactil = matchMedia('(pointer: coarse)').matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tactil ? 1.25 : 1.75));
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'display:block;width:100%;height:100%;will-change:transform;';
      contenedor.append(canvas);
      
      medirLayout();
      escena = await crear(renderer, contenedor);
      ro.observe(contenedor); // primer tamaño y primer cuadro
      contenedor.classList.add('con-3d');

      window.addEventListener('scroll', onWindowScroll, { passive: true });
      window.addEventListener('resize', medirLayout, { passive: true });

      if (estado.movimiento && matchMedia('(pointer: fine)').matches) {
        addEventListener('pointermove', (ev) => (cursor = { x: ev.clientX, y: ev.clientY }), { passive: true });
        document.documentElement.addEventListener('pointerleave', () => (cursor = undefined));
      }
      sincronizar();
    } catch (err) {
      console.warn('[3d] sin escena:', err);
      renderer?.domElement.remove();
      renderer?.dispose();
      escena = undefined;
    }
  };

  const io = new IntersectionObserver(
    ([e]) => {
      visible = e!.isIntersecting;
      if (visible) {
        medirLayout();
        if (!iniciado) {
          iniciado = true;
          void iniciar();
        }
      }
      sincronizar();
    },
    { rootMargin: '25% 0px' },
  );
  document.addEventListener('visibilitychange', sincronizar);
  void cargada.then(() => io.observe(contenedor));
}
