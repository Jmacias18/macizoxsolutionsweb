-- ==========================================================
-- Carga inicial: los 14 productos que hoy están en PRODUCTS (index.html).
-- Ejecutar UNA sola vez, después de schema.sql.
-- condicion queda vacía (no estaba en los datos originales): complétala desde el panel.
-- ==========================================================

insert into public.equipos (nombre, categoria, descripcion, precio, desde) values
  ('PC Gamer HP OMEN 30L',            'computadoras', 'Intel Core i9-10850K, RTX 3090 24 GB, 64 GB RAM, SSD + HDD, Windows 11.', 28000, false),
  ('HP 15-dy0013dx Touch',            'computadoras', 'Pantalla táctil 15.6" HD, Intel Core i5 8.ª generación, Windows 11. Casi sin uso.', 480, true),  -- ¿precio correcto?
  ('MSI GF63 Thin 10UC',              'computadoras', 'Intel Core i7 de décima generación, pantalla de 15.6".', null, true),
  ('Dell Latitude 7380',              'computadoras', 'Intel Core i7 de séptima generación, ideal para oficina y estudio.', null, true),
  ('iPhone 12 64 GB',                 'celulares',    'Equipo liberado, incluye cargador, cable y herramienta SIM. Garantía de 7 días.', null, false),
  ('Samsung S21 128 GB',              'celulares',    'Libre de fábrica, 128 GB.', null, true),
  ('Samsung S10',                     'celulares',    'Excelentes condiciones.', null, true),
  ('iPad (9.ª generación)',           'tablets',      '32 GB, Wi-Fi, pantalla Retina de 10.2". Buen estado.', null, true),
  ('Cargador Apple carga rápida',     'accesorios',   'Adaptador USB-C de 20 W con cable USB-C a Lightning.', null, true),
  ('AirPods Pro 2 OEM',               'accesorios',   'Calidad OEM con estuche de carga.', null, true),
  ('Amazon Fire TV Stick 4K Select',  'streaming',    'Películas, series, YouTube y redes sociales en tu televisor con control de voz.', 550, true),
  ('Amazon Fire TV Stick (3.ª gen.)', 'streaming',    'Convierte tu televisor en smart TV. Control remoto por voz.', null, true),
  ('Raspberry Pi 3 B',                'otros',        'Mini computadora con caja transparente, ideal para proyectos y aprendizaje.', null, true),
  ('Instax Mini 7S',                  'otros',        'Cámara instantánea con flash automático, correa de mano y 2 pilas AA (no incluidas).', null, false);
