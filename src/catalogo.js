// Valores compartidos entre la tienda y el panel.
// Deben coincidir con los CHECK de supabase/schema.sql.

export const CATEGORIAS = [
  { id: "computadoras", label: "Computadoras" },
  { id: "celulares", label: "Celulares" },
  { id: "tablets", label: "Tablets" },
  { id: "accesorios", label: "Accesorios" },
  { id: "streaming", label: "Streaming" },
  { id: "otros", label: "Otros" },
];

export const CONDICIONES = [
  { id: "nuevo", label: "Nuevo" },
  { id: "seminuevo", label: "Seminuevo" },
  { id: "usado", label: "Usado" },
];

export const ESTADOS = [
  { id: "disponible", label: "Disponible" },
  { id: "apartado", label: "Apartado" },
  { id: "vendido", label: "Vendido" },
];

export const TIPOS_PROYECTO = [
  { id: "web", label: "Página web" },
  { id: "tienda", label: "Tienda en línea" },
  { id: "sistema", label: "Sistema a medida" },
];

const porId = lista => id => lista.find(x => x.id === id);
export const tipoProyecto = porId(TIPOS_PROYECTO);
export const categoria = porId(CATEGORIAS);
export const condicion = porId(CONDICIONES);
export const estado = porId(ESTADOS);

export const money = n =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

export function textoPrecio(eq) {
  if (eq.precio == null) return "Consultar precio";
  return (eq.desde ? "desde " : "") + money(eq.precio);
}

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
