// Navegador interno: abre un proyecto dentro de la página, en una ventana con
// apariencia de navegador, sin redirigir ni mostrar su dirección.
// Nota: la URL queda oculta a la vista, no es secreta (está en el código de la página).
import { icono } from "./iconos.js";

let dlg, iframe, titulo, cargando, aviso, temporizador;

function crear() {
  dlg = document.createElement("dialog");
  dlg.className = "navegador";
  dlg.setAttribute("aria-labelledby", "nav-titulo");
  dlg.innerHTML = `
    <div class="nav-barra">
      <div class="nav-luces" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="nav-direccion">
        ${icono("candado")}
        <span id="nav-titulo"></span>
      </div>
      <div class="nav-acciones">
        <div class="nav-modos" role="group" aria-label="Tamaño de pantalla">
          <button type="button" data-modo="escritorio" aria-pressed="true" aria-label="Vista de escritorio">${icono("monitor")}</button>
          <button type="button" data-modo="celular" aria-pressed="false" aria-label="Vista de celular">${icono("celulares")}</button>
        </div>
        <button type="button" data-nav="recargar" aria-label="Recargar">${icono("recargar")}</button>
        <button type="button" data-nav="cerrar" aria-label="Cerrar vista">${icono("cerrar")}</button>
      </div>
    </div>
    <div class="nav-lienzo">
      <div class="nav-marco">
        <iframe title="Vista del proyecto" referrerpolicy="no-referrer" allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>
        <div class="nav-cargando" role="status">
          <span class="nav-giro" aria-hidden="true"></span>
          <span>Cargando proyecto…</span>
        </div>
      </div>
    </div>
    <p class="nav-aviso" hidden>Está tardando. Si el sitio no aparece, puede que no permita mostrarse dentro de otra página.</p>`;
  document.body.appendChild(dlg);

  iframe = dlg.querySelector("iframe");
  titulo = dlg.querySelector("#nav-titulo");
  cargando = dlg.querySelector(".nav-cargando");
  aviso = dlg.querySelector(".nav-aviso");

  iframe.addEventListener("load", () => {
    if (iframe.src === "about:blank" || !dlg.open) return;
    cargando.hidden = true;
    aviso.hidden = true;
    clearTimeout(temporizador);
  });

  dlg.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (e.target === dlg) return dlg.close(); // clic en el fondo
    if (!b) return;
    if (b.dataset.nav === "cerrar") dlg.close();
    if (b.dataset.nav === "recargar") cargar(iframe.dataset.url);
    if (b.dataset.modo) modo(b.dataset.modo);
  });

  // Al cerrar se descarga el sitio (detiene videos, sonidos y consumo de datos)
  dlg.addEventListener("close", () => {
    clearTimeout(temporizador);
    iframe.src = "about:blank";
    document.documentElement.classList.remove("nav-abierto");
  });
}

function modo(m) {
  dlg.dataset.modo = m;
  dlg.querySelectorAll("[data-modo]").forEach(b => b.setAttribute("aria-pressed", b.dataset.modo === m));
}

function cargar(url) {
  cargando.hidden = false;
  aviso.hidden = true;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => (aviso.hidden = false), 12000);
  iframe.dataset.url = url;
  iframe.src = url;
}

export function abrirNavegador({ nombre, url }) {
  if (!url) return;
  if (!dlg) crear();
  titulo.textContent = nombre;
  iframe.title = `Vista de ${nombre}`;
  modo(matchMedia("(max-width: 720px)").matches ? "celular" : "escritorio");
  document.documentElement.classList.add("nav-abierto");
  dlg.showModal();
  cargar(url);
}
