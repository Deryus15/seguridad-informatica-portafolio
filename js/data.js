/* ============================================================
   DATOS DEL PORTAFOLIO  —  único archivo que hay que editar
   para agregar contenido (Parcial 2, Talleres, Aportes, etc.)

   Cómo agregar un archivo nuevo:
   1. Copia el PDF a  assets/docs/<seccion>/  (y su miniatura .jpg a assets/thumbs/,
      se genera con:  python -W ignore tools/build_assets.py)
   2. Añade un objeto a la lista "archivos" del grupo correspondiente.
   ============================================================ */

const DOC = (carpeta, nombre, ext = "pdf") => `assets/docs/${carpeta}/${nombre}.${ext}`;
const THUMB = (nombre) => `assets/thumbs/${nombre}.jpg`;

window.PORTAFOLIO = {
  autor: {
    nombre: "Dereck Martínez",
    carrera: "Lic. en Gestión de Tecnología de la Información",
    universidad: "Universidad Autónoma de Chiriquí",
    siglas: "UNACHI",
    facultad: "Facultad de Economía · Depto. de Ciencias Computacionales",
    asignatura: "Seguridad Informática",
    profesor: "Andrés Miranda C.",
    periodo: "II Semestre 2026",
    sustentacion: "19/11/2026",
    lema: "¡Seguimos Avanzando… con la Ayuda de Dios!",
  },

  /* Rúbrica tomada del instructivo del Proyecto 3 (suma 100) */
  rubrica: [
    { n: "Presentación (Diseño · Portada)", p: 10, sec: "portada" },
    { n: "Plan de la Asignatura", p: 5, sec: "contenido" },
    { n: "Evaluación", p: 5, sec: "contenido" },
    { n: "Material de Clases", p: 5, sec: "material" },
    { n: "Investigación(es)", p: 10, sec: "investigaciones" },
    { n: "Parciales", p: 10, sec: "parciales" },
    { n: "Proyectos", p: 15, sec: "proyectos" },
    { n: "Talleres", p: 5, sec: "talleres" },
    { n: "Laboratorios", p: 15, sec: "laboratorios" },
    { n: "Aportes del Autor", p: 15, sec: "aportes" },
    { n: "Conclusiones", p: 5, sec: "conclusiones" },
  ],

  /* Colores de pestaña inspirados en la figura del instructivo */
  secciones: [
    {
      id: "portada", nombre: "Portada", color: "#ff2e4d",
    },
    {
      id: "contenido", nombre: "Contenido", color: "#3ddc97",
      titulo: "Contenido de la asignatura",
      sub: "Plan de la asignatura y su sistema de evaluación.",
      grupos: [
        {
          titulo: "Plan y evaluación",
          archivos: [
            { rol: "curso", etiqueta: "Plan de la Asignatura", titulo: "Contenido de la Asignatura — Seguridad Informática", archivo: DOC("contenido", "plan-de-la-asignatura"), thumb: THUMB("plan-de-la-asignatura"), original: "Contenido de la Asignatura Seguridad Informatica.pdf" },
            { rol: "curso", etiqueta: "Evaluación", titulo: "Evaluación Semestral de Seguridad Informática", archivo: DOC("material", "evaluacion-semestral"), thumb: THUMB("evaluacion-semestral"), original: "Evaluacion Semestral de Seguridad Informática.pdf" },
          ],
        },
      ],
      rubrica: true,
    },
    {
      id: "material", nombre: "Material de Clases", color: "#2ec4b6",
      titulo: "Material de clases",
      sub: "Documentación entregada por el profesor durante el curso.",
      grupos: [
        {
          titulo: "Evaluación semestral",
          archivos: [
            { rol: "curso", etiqueta: "Material", titulo: "Evaluación Semestral de Seguridad Informática", archivo: DOC("material", "evaluacion-semestral"), thumb: THUMB("evaluacion-semestral"), original: "Evaluacion Semestral de Seguridad Informática.pdf" },
          ],
        },
      ],
    },
    {
      id: "parciales", nombre: "Parciales", color: "#ff9f43",
      titulo: "Parciales",
      sub: "Evaluaciones parciales del semestre.",
      grupos: [
        {
          titulo: "Parcial 1",
          archivos: [
            { rol: "mio", etiqueta: "Mi entrega", titulo: "Parcial 1", archivo: DOC("parciales", "parcial-1-entrega"), thumb: THUMB("parcial-1-entrega"), original: "Parcial 1 HECHO.pdf" },
          ],
        },
        {
          titulo: "Parcial 2",
          archivos: [],
          pendiente: "Se agregará cuando se realice el Parcial 2.",
        },
      ],
    },
    {
      id: "proyectos", nombre: "Proyectos", color: "#ff4fa3",
      titulo: "Proyectos",
      sub: "Cada proyecto con su instructivo del profesor y mi entrega.",
      grupos: [
        {
          titulo: "Proyecto No. 1 — Investigación de Vulnerabilidades Informáticas",
          archivos: [
            { rol: "profe", etiqueta: "Instructivo del profesor", titulo: "Proyecto No. 1 · Instructivo", archivo: DOC("proyectos", "p1-instructivo"), thumb: THUMB("p1-instructivo"), original: "Documentación Profe Proyecto No1 Investigacin de Vulnerabilidades Informaticas.pdf" },
            { rol: "mio", etiqueta: "Mi entrega · Informe", titulo: "Palo Alto Networks — Informe", archivo: DOC("proyectos", "p1-informe-palo-alto"), thumb: THUMB("p1-informe-palo-alto"), original: "Proyecto No. 1 HECHO Palo Alto Networks.pdf" },
            { rol: "mio", etiqueta: "Mi entrega · Presentación", titulo: "Palo Alto Networks — Presentación", archivo: DOC("proyectos", "p1-presentacion-palo-alto"), thumb: THUMB("p1-presentacion-palo-alto"), original: "Proyecto No. 1 Palo_Alto_Networks Presentacion HECHO.pdf" },
          ],
        },
        {
          titulo: "Proyecto No. 2 — Herramientas para Exposición en AMPYME",
          archivos: [
            { rol: "profe", etiqueta: "Instructivo del profesor", titulo: "Proyecto No. 2 · Instructivo", archivo: DOC("proyectos", "p2-instructivo"), thumb: THUMB("p2-instructivo"), original: "Docuemntacion Profe Proyecto No. 2 - Herramientas para Exposición en AMPYME.pdf" },
            { rol: "mio", etiqueta: "Mi entrega · Documentación", titulo: "Teramind — Documentación UNACHI", archivo: DOC("proyectos", "p2-documentacion-teramind"), thumb: THUMB("p2-documentacion-teramind"), original: "Proyecto No. 2 AMPYME Teramind_Documentacion_UNACHI.pdf" },
            { rol: "mio", etiqueta: "Mi entrega · Presentación", titulo: "Teramind — Presentación AMPYME", archivo: DOC("proyectos", "p2-presentacion-teramind", "pptx"), thumb: null, tipo: "pptx", original: "Proyecto No. 2 Teramind_AMPYME Presentacion.pptx" },
            { rol: "mio", etiqueta: "Mi entrega · Tríptico", titulo: "Tríptico informativo de Teramind", archivo: DOC("proyectos", "p2-triptico-teramind"), thumb: THUMB("p2-triptico-teramind"), original: "Proyecto No. 2 Tríptico informativo de TERAMIND.pdf" },
          ],
        },
        {
          titulo: "Proyecto No. 3 — Portafolio Tecnológico",
          archivos: [
            { rol: "profe", etiqueta: "Instructivo del profesor", titulo: "Proyecto No. 3 · Instructivo del Portafolio", archivo: DOC("proyectos", "p3-instructivo"), thumb: THUMB("p3-instructivo"), original: "Documentacion Profe Proyecto 3 Instructivo para Crear el Portafolio Tecnologico.pdf" },
            { rol: "mio", etiqueta: "Mi entrega", titulo: "Este portafolio", archivo: null, thumb: null, tipo: "self", nota: "Estás dentro de la entrega: el Proyecto No. 3 es este mismo portafolio web." },
          ],
        },
      ],
    },
    {
      id: "laboratorios", nombre: "Laboratorios", color: "#4da3ff",
      titulo: "Laboratorios",
      sub: "Prácticas de herramientas de seguridad y análisis preventivo.",
      grupos: [
        {
          titulo: "Laboratorio No. 1 — Herramientas de Seguridad Informática",
          archivos: [
            { rol: "profe", etiqueta: "Instructivo del profesor", titulo: "Laboratorio 1 · Instructivo", archivo: DOC("laboratorios", "lab1-instructivo"), thumb: THUMB("lab1-instructivo"), original: "Documentacion Profe Laboratorio No 1 Herramientas de Seguridad Informatica.pdf" },
            { rol: "mio", etiqueta: "Mi entrega", titulo: "Laboratorio 1", archivo: DOC("laboratorios", "lab1-entrega"), thumb: THUMB("lab1-entrega"), original: "Laboratorio 1 HECHO.pdf" },
          ],
        },
        {
          titulo: "Laboratorio No. 2 — Análisis Preventivo de Disco",
          archivos: [
            { rol: "profe", etiqueta: "Instructivo del profesor", titulo: "Laboratorio 2 · Instructivo", archivo: DOC("laboratorios", "lab2-instructivo"), thumb: THUMB("lab2-instructivo"), original: "Documentacion Profe Laboratorio No2 Anlisis Preventivo de Disco.pdf" },
            { rol: "mio", etiqueta: "Mi entrega", titulo: "Laboratorio 2", archivo: DOC("laboratorios", "lab2-entrega"), thumb: THUMB("lab2-entrega"), original: "Laboratorio 2 HECHO.pdf" },
          ],
        },
      ],
    },
    {
      id: "talleres", nombre: "Talleres", color: "#a98bff",
      titulo: "Talleres",
      sub: "Talleres prácticos de la asignatura.",
      grupos: [
        { titulo: "Talleres", archivos: [], pendiente: "Aún no se han realizado talleres en el semestre." },
      ],
    },
    {
      id: "investigaciones", nombre: "Investigaciones", color: "#d08a5a",
      titulo: "Investigaciones",
      sub: "Trabajos de investigación con su instructivo y mi entrega.",
      grupos: [
        {
          titulo: "Investigación No. 1 — Conceptos de Seguridad Informática",
          archivos: [
            { rol: "profe", etiqueta: "Instructivo del profesor", titulo: "Investigación 1 · Instructivo", archivo: DOC("investigaciones", "inv1-instructivo"), thumb: THUMB("inv1-instructivo"), original: "Documentacion Profe Investigacion No 1 Conceptos de Seguridad Informatica.pdf" },
            { rol: "mio", etiqueta: "Mi entrega", titulo: "Investigación 1 — Seguridad Informática", archivo: DOC("investigaciones", "inv1-entrega"), thumb: THUMB("inv1-entrega"), original: "Investigacion_1_Seguridad_Informatica HECHO.pdf" },
          ],
        },
        {
          titulo: "Investigación No. 2 — Herramientas de Seguridad",
          archivos: [
            { rol: "profe", etiqueta: "Instructivo del profesor", titulo: "Investigación 2 · Instructivo", archivo: DOC("investigaciones", "inv2-instructivo"), thumb: THUMB("inv2-instructivo"), original: "Documentacion Profe Investigacin No.2 Herramientas de Seguridad.pdf" },
            { rol: "mio", etiqueta: "Mi entrega", titulo: "Investigación 2 — Teramind", archivo: DOC("investigaciones", "inv2-entrega"), thumb: THUMB("inv2-entrega"), original: "Investigacion_2_Teramind HECHO.pdf" },
          ],
        },
      ],
    },
    {
      id: "aportes", nombre: "Aportes", color: "#5cc8ff",
      titulo: "Aportes del autor",
      sub: "Las herramientas que más me interesaron —Teramind, Palo Alto Networks y la criptografía— convertidas en experiencias que se pueden probar.",
      aportes: true,   // se dibujan desde js/aportes.js (window.APORTES)
      grupos: [],
    },
    {
      id: "conclusiones", nombre: "Conclusiones", color: "#ff5a5a",
      titulo: "Conclusiones",
      sub: "Cierre del semestre.",
      conclusiones: [],
      pendiente: "Las conclusiones se redactarán al cierre del semestre.",
    },
  ],
};
