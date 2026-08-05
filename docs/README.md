# 📚 CampFit — Índice de Documentación Master

> **Centro de Documentación del Sistema CampFit**  
> **Última actualización:** 2026-08-05

---

## 🚀 Guías de Inicio Rápido para Agentes y Desarrolladores

- [AGENTS.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/AGENTS.md) — **Lectura obligatoria** antes de editar código (Anti-deletion rules, setup, comandos).
- [CONTEXT.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/CONTEXT.md) — Resumen ejecutivo del stack, mapa de rutas y colecciones Firestore.
- [.clinerules](file:///c:/Users/ink.enzo/Desktop/p/campfit/.clinerules) — Golden Rules y reglas anti-regresión.
- [FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md) — Lista de funciones, queries y validaciones que **NUNCA** deben borrarse.
- [REFERENCIA_RAPIDA.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/REFERENCIA_RAPIDA.md) — Cheatsheet técnico de colecciones, interfaces, scripts y comandos.

---

## 🏗️ Arquitectura y Diseño

- [FIRESTORE_SCHEMA.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/architecture/FIRESTORE_SCHEMA.md) — Especificación de las 11 colecciones NoSQL y reglas de seguridad.
- [THEME.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/THEME.md) — Sistema de diseño v2.0 (Tokens CSS, Tailwind 4, Flavors, Modo Oscuro/Claro).
- [DISENO_LISTA_COMIDAS_MULTILENGUAJE.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/DISENO_LISTA_COMIDAS_MULTILENGUAJE.md) — Arquitectura multilenguaje y motor de intolerancias.

---

## 🧩 Módulos y Features

- [BIBLIOTECA_ALIMENTOS.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/BIBLIOTECA_ALIMENTOS.md) — Catálogo central `foods_library`, alérgenos UE, macros y soft delete.
- [BIBLIOTECA_EJERCICIOS.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/BIBLIOTECA_EJERCICIOS.md) — Catálogo central `exercises_library`, músculos, equipamiento, ratings y solicitudes del cliente.

---

## 📊 Auditorías y Registro de Cambios

- [CHANGELOG.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/CHANGELOG.md) — Registro histórico de cambios y versiones.
- [AUDITORIA_UNIFICADA.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/AUDITORIA_UNIFICADA.md) — Diagnóstico unificado del estado del proyecto.

---

## 📂 Estructura Completa de la Documentación Activa (`/docs/`)

```
docs/
├── README.md                              ← Este índice master
├── REFERENCIA_RAPIDA.md                   ← Cheatsheet técnico rápido
├── FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md ← Protección de código sensible
├── THEME.md                               ← Design System & Tokens CSS
├── AUDITORIA_UNIFICADA.md                 ← Auditoría de calidad y bugs
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
