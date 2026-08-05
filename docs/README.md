# 📚 CampFit — Índice de Documentación Master

> **Centro de Documentación del Sistema CampFit**  
> **Última actualización:** 2026-08-06

---

## 🚀 Guías de Inicio Rápido y Referencia Rápida

- [MANUAL_ARQUITECTURA_MAESTRO.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/MANUAL_ARQUITECTURA_MAESTRO.md) — **Manual Maestro de Arquitectura y Desarrollo** (Visión general, stack, estructura y modelo NoSQL).
- [AGENTS.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/AGENTS.md) — Directivas obligatorias para agentes IA (Reglas anti-borrado y secuencia de trabajo).
- [CONTEXT.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/CONTEXT.md) — Resumen técnico comprimido del stack, rutas y colecciones.
- [.clinerules](file:///c:/Users/ink.enzo/Desktop/p/campfit/.clinerules) — Golden Rules y reglas anti-regresión.
- [FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md) — Lista de funciones, queries e interfaces protegidas.
- [REFERENCIA_RAPIDA.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/REFERENCIA_RAPIDA.md) — Cheatsheet técnico de colecciones, interfaces, scripts y comandos.

---

## 🏗️ Arquitectura y Diseño

- [FIRESTORE_SCHEMA.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/architecture/FIRESTORE_SCHEMA.md) — Especificación NoSQL de las 11 colecciones y reglas de seguridad.
- [THEME.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/THEME.md) — Design System v2.0 (Tokens CSS, Tailwind 4, Flavors, Modo Oscuro/Claro).

---

## 🧩 Módulos y Features

- [BIBLIOTECA_ALIMENTOS.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/BIBLIOTECA_ALIMENTOS.md) — Catálogo `foods_library`, alérgenos UE, macros y soft delete.
- [BIBLIOTECA_EJERCICIOS.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/BIBLIOTECA_EJERCICIOS.md) — Catálogo `exercises_library`, músculos, equipamiento, ratings y solicitudes del cliente.
- [DISENO_LISTA_COMIDAS_MULTILENGUAJE.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/DISENO_LISTA_COMIDAS_MULTILENGUAJE.md) — Arquitectura multilenguaje y motor de intolerancias.

---

## 📊 Auditorías e Historial

- [AUDITORIA_DOCUMENTACION.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/AUDITORIA_DOCUMENTACION.md) — Informe de auditoría de la documentación activa.
- [AUDITORIA_UNIFICADA.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/AUDITORIA_UNIFICADA.md) — Diagnóstico unificado de hallazgos y correcciones del proyecto.
- [CHANGELOG.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/CHANGELOG.md) — Registro histórico de cambios y versiones.

---

## 📂 Estructura Activa de `/docs/`

```
docs/
├── README.md                              ← Este índice master
├── MANUAL_ARQUITECTURA_MAESTRO.md         ← Manual maestro comprimido de desarrollo
├── REFERENCIA_RAPIDA.md                   ← Cheatsheet técnico rápido
├── FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md ← Protección de código sensible
├── THEME.md                               ← Design System & Tokens CSS
├── AUDITORIA_UNIFICADA.md                 ← Auditoría de calidad y bugs
├── AUDITORIA_DOCUMENTACION.md             ← Auditoría de documentación
│
├── features/
│   ├── BIBLIOTECA_ALIMENTOS.md            ← Módulo de alimentos y alérgenos UE
│   ├── BIBLIOTECA_EJERCICIOS.md           ← Módulo de ejercicios y preferencias
│   └── DISENO_LISTA_COMIDAS_MULTILENGUAJE.md ← Especificación multilenguaje
│
├── architecture/
│   └── FIRESTORE_SCHEMA.md                ← Schemas NoSQL y reglas de seguridad
│
└── _archive/                              ← Archivos legacy/obsoletos preservados
```
