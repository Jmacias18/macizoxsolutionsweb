-- ==========================================================
-- MacizoxSolutions: galería de capturas por proyecto
-- Para sistemas con inicio de sesión (BodeGO Panel, TravelFlow):
-- capturas de adentro que el visitante puede ver sin entrar.
-- Pegar completo en Supabase → SQL Editor → Run. Se puede repetir.
-- Requiere proyectos.sql.
-- ==========================================================

alter table public.proyectos
  add column if not exists galeria text[] not null default '{}';  -- URLs en orden (bucket equipos/proyectos/)
