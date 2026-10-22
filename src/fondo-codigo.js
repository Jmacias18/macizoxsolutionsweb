// Fondo de código: columnas de ceros y unos (con algún símbolo de programación)
// que bajan despacio detrás del contenido. Va en un <canvas> dentro de .fondo.
// - Tenue a propósito: el texto de la página siempre manda.
// - ~24 cuadros por segundo y se pausa si la pestaña no está visible.
// - Con "reducir movimiento" se dibuja una sola vez, quieto.

const SIMBOLOS = ["</>", "{ }", "=>", "&&", "fn", "if", "0x", "[ ]", ";"];
const FPS = 24;

export function iniciarFondoCodigo(contenedor) {
  const canvas = document.createElement("canvas");
  canvas.className = "fondo-codigo";
  contenedor.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const quieto = matchMedia("(prefers-reduced-motion: reduce)");
  let columnas = [], ancho = 0, alto = 0, paso = 0, tam = 0, raf = 0, ultimo = 0;

  const azar = (a, b) => a + Math.random() * (b - a);
  const caracter = () => (Math.random() < 0.06
    ? SIMBOLOS[(Math.random() * SIMBOLOS.length) | 0]
    : Math.random() < 0.5 ? "0" : "1");

  function nuevaColumna(x, enPantalla) {
    const largo = (azar(6, 16)) | 0;
    return {
      x,
      y: enPantalla ? azar(-alto, alto) : azar(-alto * 0.6, -largo * paso),
      vel: azar(0.35, 1.1),          // px por cuadro, lento
      largo,
      chars: Array.from({ length: largo }, caracter),
      brillo: azar(0.35, 1),         // unas columnas más visibles que otras
    };
  }

  function medir() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    ancho = innerWidth; alto = innerHeight;
    canvas.width = ancho * dpr; canvas.height = alto * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tam = ancho < 640 ? 12 : 14;
    paso = tam * 1.45;
    const sep = ancho < 640 ? 34 : 28;  // en celular, menos columnas
    columnas = [];
    for (let x = sep / 2; x < ancho; x += sep) {
      if (Math.random() < 0.55) columnas.push(nuevaColumna(x, true)); // no todas: que respire
    }
    ctx.font = `500 ${tam}px ui-monospace, "SFMono-Regular", Consolas, monospace`;
    ctx.textAlign = "center";
  }

  function dibujar(mover) {
    ctx.clearRect(0, 0, ancho, alto);
    for (let i = 0; i < columnas.length; i++) {
      const c = columnas[i];
      if (mover) {
        c.y += c.vel * 2;
        if (Math.random() < 0.04) c.chars[(Math.random() * c.largo) | 0] = caracter(); // parpadeo de dígitos
        if (c.y - c.largo * paso > alto) columnas[i] = nuevaColumna(c.x, false);
      }
      for (let j = 0; j < c.largo; j++) {
        const y = c.y - j * paso;
        if (y < -paso || y > alto + paso) continue;
        const cabeza = j === 0;
        const a = cabeza ? 0.42 * c.brillo : 0.2 * c.brillo * (1 - j / c.largo);
        ctx.fillStyle = cabeza ? `rgba(196, 181, 253, ${a})` : `rgba(139, 92, 246, ${a})`;
        ctx.fillText(c.chars[j], c.x, y);
      }
    }
  }

  function cuadro(t) {
    raf = requestAnimationFrame(cuadro);
    if (t - ultimo < 1000 / FPS) return;
    ultimo = t;
    dibujar(true);
  }

  function arrancar() {
    cancelAnimationFrame(raf);
    if (quieto.matches) return dibujar(false);
    raf = requestAnimationFrame(cuadro);
  }

  // En celular, la barra del navegador cambia el alto al hacer scroll:
  // solo se rehacen las columnas si cambia el ancho (p. ej. al girar el teléfono).
  let espera;
  addEventListener("resize", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      if (innerWidth !== ancho) medir();
      else {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        alto = innerHeight; canvas.height = alto * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = `500 ${tam}px ui-monospace, "SFMono-Regular", Consolas, monospace`;
        ctx.textAlign = "center";
      }
      arrancar();
    }, 200);
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? cancelAnimationFrame(raf) : arrancar()));
  quieto.addEventListener?.("change", arrancar);

  medir();
  arrancar();
}
