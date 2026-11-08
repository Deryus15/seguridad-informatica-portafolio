# Historial de cambios

Formato de fechas: dd/MM/yyyy

## 07/11/2026 — v1.3 · Publicación en línea (GitHub Pages)
- Repositorio público con historial limpio (el repositorio privado anterior queda como respaldo).
- Cédula del autor tapada en los PDF públicos (Parcial 1 a mano, Laboratorios 1 y 2) con `tools/build_assets.py`.
- Commits con correo `noreply` de GitHub.

## 07/11/2026 — v1.2 · Ajustes para móvil
- Corregido desborde horizontal en pantallas chicas (textos gigantes de fondo de las secciones).
- Barra del visor de documentos adaptada a móvil (botones ya no se cortan).

## 07/11/2026 — v1.1 · Visor corregido + Aportes
- **Corregido:** al abrir un documento aparecía «rechaza la conexión». Causa: un `<iframe>` con PDF no funciona al abrir `index.html` con doble clic (`file://`). Ahora el visor muestra las páginas como imágenes WebP (`assets/pages/`), sin depender del visor de PDF del navegador.
- **Nuevo:** sección Aportes del autor con 6 experiencias interactivas (js/aportes.js): constructor de reglas de Teramind, caso de Carlos con medidor de riesgo, juego «malicioso/descuidado/comprometido», calculadora de costos de Teramind, viaje de un paquete por las capas de Palo Alto Networks (SP3 vs UTM) y laboratorio de cifrado/criptoanálisis.
- Visor: zoom, contador de páginas, enlace al PDF original.

## 07/11/2026 — v1.0 · Primera versión
- Estructura del portafolio según el instructivo del Proyecto No. 3 (orden de secciones).
- Portada con retrato de código interactivo (canvas), terminal tipeada, texto "descifrado".
- Fondo de lluvia de código reactivo a scroll/mouse; acento de color por sección.
- Incrustados 19 archivos (18 PDF con visor + 1 PPTX descargable) en: Contenido, Material de Clases, Parciales (P1), Proyectos (1, 2, 3), Laboratorios (1, 2), Investigaciones (1, 2).
- Rúbrica interactiva (100 pts) en Contenido.
- Secciones maquetadas sin contenido aún: Parcial 2, Talleres, Aportes, Conclusiones.
- `tools/build_assets.py` para regenerar miniaturas, conteo de páginas y datos del retrato.

## Pendiente
- [ ] Parcial 2 (cuando se realice)
- [ ] Talleres
- [ ] Aportes: revisar/ampliar según lo que pida el profesor (15 pts)
- [ ] Conclusiones (5 pts)
- [ ] Sustentación: 19/11/2026
