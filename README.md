# Portafolio Tecnológico — Seguridad Informática

**Autor:** Dereck Martínez · Lic. en Gestión de Tecnología de la Información
**Universidad:** Universidad Autónoma de Chiriquí (UNACHI) · Facultad de Economía
**Asignatura:** Seguridad Informática · Prof. Andrés Miranda C. · II Semestre 2026
**Sustentación:** 19/11/2026 · Proyecto No. 3 (100 pts)

Portafolio web interactivo que reúne todas las asignaciones del semestre, en el orden que pide el instructivo:

`Portada → Contenido → Material de Clases → Parciales → Proyectos → Laboratorios → Talleres → Investigaciones → Aportes → Conclusiones`

> Proyecto universitario. No pertenece a Vorluno.

🌐 **Versión en línea:** https://deryus15.github.io/seguridad-informatica-portafolio/

## ▶ Cómo abrirlo

Abre **`index.html`** con doble clic (Chrome o Edge recomendado). No requiere instalar nada ni servidor.
Las tipografías vienen de Google Fonts; sin internet se usan tipografías del sistema.

## Qué incluye

- **Portada:** retrato hecho de caracteres de código que reacciona al cursor (repulsión, lente que revela la foto real, inclinación 3D, onda al hacer clic y desintegración al hacer scroll).
- **Fondo de lluvia de código** que acelera con el scroll y cambia de color con cada sección (colores de pestaña tomados del instructivo).
- **Cada archivo real** incrustado en su sección con miniatura, visor propio a pantalla completa (las páginas del PDF se muestran como imágenes, así funciona con doble clic en cualquier navegador; zoom, contador de páginas, ← → entre documentos, `Esc` para cerrar), enlace al PDF original y botón de descarga.
- **Aportes del autor:** 6 experiencias interactivas basadas en mis propios trabajos (Teramind ×4, Palo Alto Networks, criptografía): constructor de reglas, el caso de Carlos, juego de tipos de amenaza interna, calculadora de costos, viaje de un paquete por las 7 capas y laboratorio de cifrado.
- Rúbrica del proyecto (100 pts) interactiva en *Contenido*.
- Secciones pendientes (Parcial 2, Talleres, Conclusiones) ya maquetadas.

## Estructura

```
Portafolio Web/
├─ index.html            ← archivo principal
├─ css/style.css · css/aportes.css
├─ js/
│  ├─ data.js            ← ÚNICO archivo a editar para agregar contenido
│  ├─ main.js            ← render, navegación, visor, efectos
│  ├─ hero.js            ← retrato de código de la portada
│  ├─ bg.js              ← lluvia de código de fondo
│  ├─ aportes.js         ← los 6 aportes interactivos (window.APORTES)
│  ├─ face-data.js       ← (generado) mapa del retrato
│  └─ pages.js           ← (generado) nº de páginas por PDF
├─ assets/
│  ├─ docs/<seccion>/    ← PDFs/PPTX originales (nombres limpios)
│  ├─ thumbs/            ← miniaturas (generadas)
│  ├─ pages/<doc>/NNN.webp ← páginas de cada PDF para el visor (generadas)
│  └─ img/foto.jpg
├─ tools/build_assets.py ← copia archivos, genera miniaturas y datos del retrato
├─ HISTORIAL.md
└─ README.md
```

## Cómo continuar el trabajo

```bash
git clone https://github.com/Deryus15/seguridad-informatica-portafolio.git
cd seguridad-informatica-portafolio
```

### Agregar el Parcial 2 / un taller / un aporte
1. Copia el PDF a `assets/docs/<seccion>/` (ej. `assets/docs/parciales/parcial-2-entrega.pdf`).
2. Genera la miniatura y el conteo de páginas: `python -W ignore tools/build_assets.py "<carpeta original>"`
   (requiere `pip install pymupdf pillow numpy`), o crea la miniatura `.jpg` a mano en `assets/thumbs/`.
3. En `js/data.js`, añade un objeto a `archivos` del grupo correspondiente y borra la propiedad `pendiente`:
   ```js
   { rol: "mio", etiqueta: "Mi entrega", titulo: "Parcial 2", archivo: DOC("parciales","parcial-2-entrega"), thumb: THUMB("parcial-2-entrega"), original: "Parcial 2 HECHO.pdf" }
   ```
4. Conclusiones: llena el arreglo `conclusiones: [{ texto: "…" }]` en `data.js`.
5. Actualiza `HISTORIAL.md` y haz commit.

### Agregar otro aporte
En `js/aportes.js` escribe una función `mi_aporte(el)` que dibuje dentro de `el` y añade un objeto a `window.APORTES` (`id`, `n`, `tag`, `titulo`, `desc`, `src`, `mount`).

### Probar en local con servidor (opcional)
```bash
python -m http.server 8000   # luego abrir http://localhost:8000
```

## Notas
- **Datos personales:** la versión pública tiene tapada la cédula del autor en los PDF (Parcial 1, Laboratorios 1 y 2). `tools/build_assets.py` lo hace solo al regenerar; los textos a tapar están en `tools/datos_privados.txt` (no se sube a GitHub). Si agregas nuevos documentos con datos personales, añade el texto a ese archivo o una región en `REGIONES_TAPAR`.
- La presentación de Teramind es `.pptx`: el navegador no puede mostrarla, por eso se ofrece como descarga.
- Respeta `prefers-reduced-motion`: con animaciones reducidas se desactivan los efectos pesados.
