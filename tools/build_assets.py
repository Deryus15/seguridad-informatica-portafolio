#!/usr/bin/env python3
"""
Prepara los assets del portafolio.

Uso (desde la raíz del repo):
    python -W ignore tools/build_assets.py "<carpeta con las asignaciones originales>"

Si no se pasa argumento usa la carpeta padre del repo.

Qué hace:
  1. Copia cada archivo original a assets/docs/<seccion>/ con nombre limpio (sin tildes/espacios).
  2. Genera miniaturas JPG de la 1ra página de cada PDF en assets/thumbs/.
  3. Procesa la foto de portada y genera js/face-data.js (mapa de luminancia + máscara)
     que usa el efecto "retrato hecho de código" de la portada.
  4. Copia la foto a assets/img/foto.jpg (se usa en el "spotlight" del hero).
"""
import base64
import os
import shutil
import sys
from pathlib import Path

import pymupdf
from PIL import Image, ImageFilter, ImageOps

REPO = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else REPO.parent

# (ruta original relativa a SRC) -> (ruta destino dentro de assets/docs)
MAPA = {
    "Contenido/Contenido de la Asignatura Seguridad Informatica.pdf": "contenido/plan-de-la-asignatura.pdf",
    "Material de Clases/Evaluacion Semestral de Seguridad Informática.pdf": "material/evaluacion-semestral.pdf",
    "Parciales/1/Parcial 1 HECHO.pdf": "parciales/parcial-1-entrega.pdf",
    "Proyectos/1/Documentación Profe Proyecto No1 Investigacin de Vulnerabilidades Informaticas.pdf": "proyectos/p1-instructivo.pdf",
    "Proyectos/1/Proyecto No. 1 HECHO Palo Alto Networks.pdf": "proyectos/p1-informe-palo-alto.pdf",
    "Proyectos/1/Proyecto No. 1 Palo_Alto_Networks Presentacion HECHO.pdf": "proyectos/p1-presentacion-palo-alto.pdf",
    "Proyectos/2/Docuemntacion Profe Proyecto No. 2 - Herramientas para Exposición en AMPYME.pdf": "proyectos/p2-instructivo.pdf",
    "Proyectos/2/Proyecto No. 2 AMPYME Teramind_Documentacion_UNACHI.pdf": "proyectos/p2-documentacion-teramind.pdf",
    "Proyectos/2/Proyecto No. 2 Teramind_AMPYME Presentacion.pptx": "proyectos/p2-presentacion-teramind.pptx",
    "Proyectos/2/Proyecto No. 2 Tríptico informativo de TERAMIND.pdf": "proyectos/p2-triptico-teramind.pdf",
    "Proyectos/3/Documentacion Profe Proyecto 3 Instructivo para Crear el Portafolio Tecnologico.pdf": "proyectos/p3-instructivo.pdf",
    "Laboratorios/1/Documentacion Profe Laboratorio No 1 Herramientas de Seguridad Informatica.pdf": "laboratorios/lab1-instructivo.pdf",
    "Laboratorios/1/Laboratorio 1 HECHO.pdf": "laboratorios/lab1-entrega.pdf",
    "Laboratorios/2/Documentacion Profe Laboratorio No2 Anlisis Preventivo de Disco.pdf": "laboratorios/lab2-instructivo.pdf",
    "Laboratorios/2/Laboratorio 2 HECHO.pdf": "laboratorios/lab2-entrega.pdf",
    "Investigaciones/1/Documentacion Profe Investigacion No 1 Conceptos de Seguridad Informatica.pdf": "investigaciones/inv1-instructivo.pdf",
    "Investigaciones/1/Investigacion_1_Seguridad_Informatica HECHO.pdf": "investigaciones/inv1-entrega.pdf",
    "Investigaciones/2/Documentacion Profe Investigacin No.2 Herramientas de Seguridad.pdf": "investigaciones/inv2-instructivo.pdf",
    "Investigaciones/2/Investigacion_2_Teramind HECHO.pdf": "investigaciones/inv2-entrega.pdf",
}


def copiar_docs():
    faltan = []
    for origen, destino in MAPA.items():
        o = SRC / origen
        d = REPO / "assets" / "docs" / destino
        if not o.exists():
            faltan.append(origen)
            continue
        d.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(o, d)
        print("doc  ", destino)
    if faltan:
        print("\n[!] No se encontraron:", *faltan, sep="\n    ")


# Datos personales que NO deben quedar en la versión pública (texto buscable en los PDF).
# Para datos dentro de imágenes/manuscritos usa REGIONES_TAPAR: (página, (x0, y0, x1, y1)) como
# FRACCIONES del ancho/alto de la página (0 a 1), contadas desde arriba a la izquierda.
# Los textos a tapar viven en tools/datos_privados.txt (UNO POR LÍNEA, NO se sube a GitHub, está en .gitignore).
_priv = Path(__file__).resolve().parent / "datos_privados.txt"
TEXTOS_TAPAR = [l.strip() for l in _priv.read_text(encoding="utf-8").splitlines() if l.strip()] if _priv.exists() else []
REGIONES_TAPAR = {
    "parciales/parcial-1-entrega.pdf": [(1, (0.625, 0.278, 0.795, 0.308))],  # cédula manuscrita
}


def tapar_datos():
    """Tapa (redacta de verdad, borrando el contenido) los datos personales en las copias del repo."""
    for pdf in (REPO / "assets" / "docs").rglob("*.pdf"):
        doc = pymupdf.open(pdf)
        rel = pdf.relative_to(REPO / "assets" / "docs").as_posix()
        cambios = 0
        for i, pg in enumerate(doc, start=1):
            rects = [r for t in TEXTOS_TAPAR for r in pg.search_for(t)]
            W, H = pg.rect.width, pg.rect.height
            rects += [pymupdf.Rect(r[0] * W, r[1] * H, r[2] * W, r[3] * H) for (n, r) in REGIONES_TAPAR.get(rel, []) if n == i]
            for r in rects:
                pg.add_redact_annot(r, fill=(0, 0, 0))
            if rects:
                pg.apply_redactions()
                cambios += len(rects)
        if cambios:
            tmp = pdf.with_suffix(".tmp.pdf")
            doc.save(tmp, garbage=4, deflate=True)
            doc.close()
            tmp.replace(pdf)
            print("tapado", rel, f"({cambios})")
        else:
            doc.close()


def miniaturas():
    out = REPO / "assets" / "thumbs"
    out.mkdir(parents=True, exist_ok=True)
    paginas = {}
    for pdf in (REPO / "assets" / "docs").rglob("*.pdf"):
        doc = pymupdf.open(pdf)
        paginas[pdf.stem] = len(doc)
        page = doc[0]
        zoom = 560 / page.rect.width
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
        nombre = pdf.stem + ".jpg"
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        img.save(out / nombre, quality=80, optimize=True)
        print("thumb", nombre, f"({len(doc)} págs)")
        # Páginas completas como imágenes: el visor las usa porque un <iframe> con PDF
        # NO funciona al abrir index.html con doble clic (file://) en muchos navegadores.
        carpeta = REPO / "assets" / "pages" / pdf.stem
        carpeta.mkdir(parents=True, exist_ok=True)
        for i, pg in enumerate(doc, start=1):
            z = 1100 / pg.rect.width
            px = pg.get_pixmap(matrix=pymupdf.Matrix(z, z), alpha=False)
            Image.frombytes("RGB", (px.width, px.height), px.samples).save(
                carpeta / f"{i:03d}.webp", quality=74, method=6)
    import json
    (REPO / "js").mkdir(exist_ok=True)
    (REPO / "js" / "pages.js").write_text(
        "// Generado por tools/build_assets.py — no editar a mano\nwindow.PAGES = "
        + json.dumps(paginas, indent=2, sort_keys=True) + ";\n",
        encoding="utf-8",
    )


def retrato():
    foto = SRC / "Portada" / "mifoto.jpeg"
    if not foto.exists():
        print("[!] No se encontró Portada/mifoto.jpeg")
        return
    (REPO / "assets" / "img").mkdir(parents=True, exist_ok=True)
    img = Image.open(foto).convert("RGB")
    img.save(REPO / "assets" / "img" / "foto.jpg", quality=88, optimize=True)

    W = 150
    H = round(W * img.height / img.width)
    small = img.resize((W, H), Image.LANCZOS)

    # Luminancia con contraste ajustado (la foto es "low-key", hay que levantar sombras)
    import numpy as np
    base = small.convert("L")
    L = np.asarray(base, dtype=np.float32)
    # Curva tonal fija (levanta sombras sin amplificar el fondo) + realce de detalle local
    tono = 255.0 * np.power(L / 255.0, 0.5)
    blur = np.asarray(Image.fromarray(tono.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3.5)), dtype=np.float32)
    detalle = tono + 2.6 * (tono - blur)               # high-pass: define ojos, nariz, labios
    mezcla = np.clip(0.4 * tono + 0.6 * detalle, 0, 255)

    # Máscara: solo el carmesí puro del fondo (g/r bajo); la piel en sombra queda dentro
    rgb = np.asarray(small, dtype=np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    fondo = (r > 45) & (g < r * 0.20) & (b < r * 0.26)
    sujeto = ~fondo
    vacio = sujeto & (L < 11)                          # negro puro (pelo / saco / esquinas)
    # normalizar contraste usando solo píxeles del sujeto con luz
    ref = mezcla[sujeto & ~vacio]
    lo, hi = np.percentile(ref, 4), np.percentile(ref, 97)
    lumf = np.clip((mezcla - lo) / (hi - lo), 0, 1) ** 1.35
    lumf[vacio] = 0.0
    # atenuar el saco (parte baja) para que el rostro domine
    yy = np.linspace(0, 1, H)[:, None]
    lumf *= np.clip(1.0 - (yy - 0.60) * 1.6, 0.4, 1.0)
    lum = Image.fromarray((lumf * 255).astype(np.uint8))
    Image.fromarray((lumf * sujeto * 255).astype(np.uint8)).save(REPO / "tools" / "_preview_lum.png")  # solo para revisar

    mask = Image.fromarray((sujeto * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))

    datos = bytearray()
    lp, mp = lum.load(), mask.load()
    for y in range(H):
        for x in range(W):
            datos.append(lp[x, y])
            datos.append(mp[x, y])
    b64 = base64.b64encode(bytes(datos)).decode()
    js = f"// Generado por tools/build_assets.py — no editar a mano\nwindow.FACE_DATA = {{ w: {W}, h: {H}, data: \"{b64}\" }};\n"
    (REPO / "js").mkdir(exist_ok=True)
    (REPO / "js" / "face-data.js").write_text(js, encoding="utf-8")
    print(f"face-data.js  {W}x{H}  ({len(js)//1024} KB)")


if __name__ == "__main__":
    print("Origen:", SRC)
    copiar_docs()
    tapar_datos()
    miniaturas()
    retrato()
