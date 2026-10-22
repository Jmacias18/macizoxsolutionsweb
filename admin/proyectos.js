// Sección "Proyectos" del panel: portafolio (TravelFlow, BodeGO, RMZ…).
import { supabase } from "../src/supabase.js";
import { TIPOS_PROYECTO, tipoProyecto, esc } from "../src/catalogo.js";
import * as fotos from "../src/fotos.js";
import { icono } from "../src/iconos.js";
import { abrirNavegador } from "../src/navegador.js";
import { $, aviso, kb, htmlError, setOcupado, confirmarEliminar } from "./ui.js";

const CARPETA = "proyectos/";
const AYUDA_CAPTURA = "Una captura de la pantalla principal del sitio. Se ve en la tarjeta antes de abrirlo.";

let proyectos = [];
let iniciado = false;

export function iniciarProyectos() {
  if (iniciado) return;
  iniciado = true;
  cargar();
}

/* ==========================================================
   Lista
   ========================================================== */
const ESQUELETO = `
  <li class="equipo cargando" aria-hidden="true">
    <div class="miniatura ancha skeleton"></div>
    <div class="equipo-info">
      <span class="sk skeleton" style="width:60%"></span>
      <span class="sk skeleton" style="width:35%"></span>
    </div>
  </li>`;

async function cargar() {
  $("resumen-proyectos").textContent = "Cargando proyectos…";
  $("vacio-proyectos").hidden = true;
  $("lista-proyectos").setAttribute("aria-busy", "true");
  $("lista-proyectos").innerHTML = ESQUELETO.repeat(3);

  const { data, error } = await supabase.from("proyectos").select("*")
    .order("orden", { ascending: true }).order("creado_en", { ascending: true });
  $("lista-proyectos").setAttribute("aria-busy", "false");
  if (error) {
    $("lista-proyectos").innerHTML = "";
    const falta = error.code === "42P01" || /proyectos/.test(error.message) && /exist|schema cache/i.test(error.message);
    $("resumen-proyectos").textContent = "No se pudieron cargar los proyectos.";
    return falta
      ? vacio("Falta crear la tabla", "Ejecuta supabase/proyectos.sql en el SQL Editor de Supabase y vuelve a intentar.", "Reintentar", cargar)
      : vacio("No se pudo conectar", "Revisa tu conexión a internet e inténtalo de nuevo.", "Reintentar", cargar);
  }
  proyectos = data;
  render();
}

let accionVacio = null;
function vacio(titulo, texto, boton, accion) {
  $("vacio-proyectos-titulo").textContent = titulo;
  $("vacio-proyectos-texto").textContent = texto;
  $("vacio-proyectos-accion").textContent = boton;
  accionVacio = accion;
  $("vacio-proyectos").hidden = false;
}
$("vacio-proyectos-accion").addEventListener("click", () => accionVacio?.());

function render() {
  const publicados = proyectos.filter(p => p.publicado).length;
  $("resumen-proyectos").textContent = `${proyectos.length} en total · ${publicados} visible${publicados === 1 ? "" : "s"} en la página`;
  $("lista-proyectos").innerHTML = proyectos.map(itemHtml).join("");
  $("vacio-proyectos").hidden = true;
  if (!proyectos.length) {
    vacio("Aún no tienes proyectos", "Agrega TravelFlow, BodeGO o cualquier trabajo que quieras mostrar.", "Agregar proyecto", () => abrirFormulario());
  }
}

function itemHtml(p) {
  const img = p.imagen_url ? `<img src="${esc(p.imagen_url)}" alt="" loading="lazy" />` : icono("imagen");
  const modo = p.url ? "Vista en vivo" : "Solo captura";
  return `
    <li class="equipo${p.publicado ? "" : " es-vendido"}" data-id="${p.id}">
      ${p.url
        ? `<button type="button" class="miniatura ancha" data-accion="ver" aria-label="Ver ${esc(p.nombre)}">${img}</button>`
        : `<div class="miniatura ancha">${img}</div>`}
      <div class="equipo-info">
        <h3>${esc(p.nombre)}</h3>
        <div class="equipo-meta">${esc(tipoProyecto(p.tipo)?.label || p.tipo)} · ${modo} · Posición ${p.orden}</div>
        <div class="equipo-fila">
          <span class="etiqueta ${p.publicado ? "disponible" : "vendido"}">${p.publicado ? "Visible" : "Oculto"}</span>
        </div>
      </div>
      <div class="equipo-acciones">
        <button type="button" class="btn btn-ghost btn-sm" data-accion="editar">Editar</button>
        <button type="button" class="btn btn-ghost btn-sm" data-accion="visible">${p.publicado ? "Ocultar" : "Mostrar"}</button>
        <button type="button" class="btn btn-ghost btn-sm btn-eliminar" data-accion="eliminar">Eliminar</button>
      </div>
    </li>`;
}

$("lista-proyectos").addEventListener("click", e => {
  const b = e.target.closest("[data-accion]");
  if (!b) return;
  const p = proyectos.find(x => x.id === b.closest("[data-id]").dataset.id);
  if (!p) return;
  if (b.dataset.accion === "ver") abrirNavegador({ nombre: p.nombre, url: p.url });
  if (b.dataset.accion === "editar") abrirFormulario(p);
  if (b.dataset.accion === "visible") alternarVisible(p, b);
  if (b.dataset.accion === "eliminar") pedirEliminar(p);
});

function reemplazar(fila) {
  const i = proyectos.findIndex(x => x.id === fila.id);
  if (i >= 0) proyectos[i] = fila;
  else proyectos.push(fila);
  proyectos.sort((a, b) => a.orden - b.orden || a.creado_en.localeCompare(b.creado_en));
  render();
}

async function alternarVisible(p, btn) {
  btn.disabled = true;
  const { data, error } = await supabase.from("proyectos").update({ publicado: !p.publicado }).eq("id", p.id).select().single();
  if (error) {
    btn.disabled = false;
    return aviso("No se pudo cambiar la visibilidad. Inténtalo de nuevo.", true);
  }
  reemplazar(data);
  aviso(data.publicado ? `“${p.nombre}” ya se muestra en la página.` : `“${p.nombre}” se ocultó de la página.`);
}

function pedirEliminar(p) {
  confirmarEliminar({
    nombre: p.nombre,
    nota: "Si solo quieres quitarlo un tiempo, usa <b>Ocultar</b>.",
    accion: async () => {
      const { error } = await supabase.from("proyectos").delete().eq("id", p.id);
      if (error) {
        aviso("No se pudo eliminar. Inténtalo de nuevo.", true);
        return false;
      }
      if (p.imagen_url) await fotos.borrar(p.imagen_url);
      proyectos = proyectos.filter(x => x.id !== p.id);
      render();
      aviso(`“${p.nombre}” eliminado.`);
    },
  });
}

/* ==========================================================
   Formulario
   ========================================================== */
const dlg = $("dlg-proyecto");
const form = $("form-proyecto");
let editando = null;
let capturaNueva = null;
let quitarCaptura = false;
let previewUrl = null;

$("p-tipo").innerHTML = TIPOS_PROYECTO.map(t => `<option value="${t.id}">${t.label}</option>`).join("");

function abrirFormulario(p = null) {
  editando = p;
  capturaNueva = null;
  quitarCaptura = false;
  form.reset();
  errorForm("");
  $("titulo-proyecto").textContent = p ? "Editar proyecto" : "Nuevo proyecto";
  form.nombre.value = p?.nombre || "";
  form.tipo.value = p?.tipo || "web";
  form.descripcion.value = p?.descripcion || "";
  form.url.value = p?.url || "";
  form.orden.value = p?.orden ?? siguienteOrden();
  form.publicado.checked = p ? p.publicado : true;
  liberarPreview();
  pintarCaptura(p?.imagen_url || null);
  $("captura-info").textContent = AYUDA_CAPTURA;
  dlg.showModal();
  if (!p) form.nombre.focus({ preventScroll: true });
}

const siguienteOrden = () => (proyectos.length ? Math.max(...proyectos.map(p => p.orden)) + 1 : 1);

function errorForm(msg) {
  $("error-proyecto").innerHTML = htmlError(msg);
  $("error-proyecto").hidden = !msg;
  ["nombre", "url"].forEach(n => errorCampo(n, ""));
}

function errorCampo(nombre, msg) {
  const el = $("err-p-" + nombre);
  el.innerHTML = htmlError(msg);
  el.hidden = !msg;
  form[nombre].setAttribute("aria-invalid", msg ? "true" : "false");
  if (msg) form[nombre].focus();
}
form.nombre.addEventListener("input", () => errorCampo("nombre", ""));
form.url.addEventListener("input", () => errorCampo("url", ""));

// Acepta "bodego.vercel.app" y lo completa con https://. Devuelve null si está vacío, o lanza si no es válida.
function normalizarUrl(texto) {
  const t = texto.trim();
  if (!t) return null;
  const url = new URL(/^https?:\/\//i.test(t) ? t : "https://" + t);
  if (url.protocol !== "https:") throw new Error("https");
  if (!url.hostname.includes(".")) throw new Error("host");
  return url.href;
}

function leerUrl() {
  try {
    return { url: normalizarUrl(form.url.value) };
  } catch (e) {
    return { error: e.message === "https"
      ? "El enlace debe empezar con https:// (los sitios de Vercel y Cloudflare ya lo tienen)."
      : "Ese enlace no parece válido. Ejemplo: https://mi-proyecto.vercel.app" };
  }
}

$("btn-probar").addEventListener("click", () => {
  const { url, error } = leerUrl();
  if (error) return errorCampo("url", error);
  if (!url) return errorCampo("url", "Escribe el enlace para probar la vista.");
  form.url.value = url;
  abrirNavegador({ nombre: form.nombre.value.trim() || "Vista previa", url });
});

function liberarPreview() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
}

function pintarCaptura(src) {
  $("captura-preview").innerHTML = src
    ? `<img src="${esc(src)}" alt="Vista previa de la captura" />`
    : `<span>${icono("imagen")}Sin captura</span>`;
  $("captura-btn-texto").textContent = src ? "Cambiar captura" : "Subir captura";
  $("captura-quitar").hidden = !src;
}

$("captura-input").addEventListener("change", async e => {
  const archivo = e.target.files[0];
  e.target.value = "";
  if (!archivo) return;
  $("captura-info").textContent = "Comprimiendo…";
  try {
    capturaNueva = await fotos.comprimir(archivo, { ladoMax: 1600 });
    quitarCaptura = false;
    liberarPreview();
    previewUrl = URL.createObjectURL(capturaNueva);
    pintarCaptura(previewUrl);
    $("captura-info").textContent = `${kb(archivo.size)} → ${kb(capturaNueva.size)}`;
  } catch (err) {
    $("captura-info").textContent = AYUDA_CAPTURA;
    errorForm(err.message || "No se pudo leer la imagen. Prueba con otra.");
  }
});

$("captura-quitar").addEventListener("click", () => {
  capturaNueva = null;
  quitarCaptura = true;
  liberarPreview();
  pintarCaptura(null);
  $("captura-info").textContent = AYUDA_CAPTURA;
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  errorForm("");

  const nombre = form.nombre.value.trim();
  if (!nombre) return errorCampo("nombre", "Escribe el nombre del proyecto, por ejemplo “TravelFlow”.");
  const { url, error: errorUrl } = leerUrl();
  if (errorUrl) return errorCampo("url", errorUrl);
  if (!url && !capturaNueva && (quitarCaptura || !editando?.imagen_url)) {
    return errorForm("Agrega un enlace o una captura: sin ninguno de los dos, no hay nada que mostrar.");
  }

  const fila = {
    nombre,
    tipo: form.tipo.value,
    descripcion: form.descripcion.value.trim() || null,
    url,
    orden: Number.parseInt(form.orden.value, 10) || 0,
    publicado: form.publicado.checked,
  };

  ocupado(true);
  const anterior = editando?.imagen_url || null;
  let subida = null;
  try {
    if (capturaNueva) {
      subida = await fotos.subir(capturaNueva, CARPETA);
      fila.imagen_url = subida;
    } else if (quitarCaptura) {
      fila.imagen_url = null;
    }

    const consulta = editando
      ? supabase.from("proyectos").update(fila).eq("id", editando.id)
      : supabase.from("proyectos").insert(fila);
    const { data, error } = await consulta.select().single();
    if (error) throw error;

    // La captura vieja se borra solo cuando el cambio ya quedó guardado.
    if (anterior && (subida || quitarCaptura)) await fotos.borrar(anterior);

    reemplazar(data);
    ocupado(false);
    dlg.close();
    aviso(editando ? "Cambios guardados." : `“${data.nombre}” agregado al portafolio.`);
  } catch (err) {
    if (subida) await fotos.borrar(subida);
    errorForm("No se guardó. Revisa tu conexión e inténtalo de nuevo. (" + (err.message || err) + ")");
  } finally {
    ocupado(false);
  }
});

function ocupado(si) {
  setOcupado(si);
  const btn = $("btn-guardar-proyecto");
  btn.disabled = si;
  btn.textContent = si ? "Guardando…" : "Guardar";
}

$("btn-nuevo-proyecto").addEventListener("click", () => abrirFormulario());
dlg.addEventListener("close", liberarPreview);
