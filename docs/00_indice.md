# 📚 CampFit - Documentación del Proyecto

> **Stack:** Astro 7 + Tailwind CSS 4 + Firebase 11 + Nanostores  
> **Arquitectura:** Vanilla JS (sin React). Compilación y enrutado estático.  
> **Estado:** En desarrollo activo.
> **Última actualización:** 2026-07-31

---

## 🎯 Documento Maestro

**👉 `docs/MASTER.md` - Toda la documentación unificada en un solo archivo**

Este archivo contiene toda la información del proyecto consolidada:
- ✅ Visión y objetivos
- ✅ Stack tecnológico completo
- ✅ Modelo de datos Firestore
- ✅ Design system (colores, tipografía, componentes)
- ✅ Estructura del proyecto
- ✅ Flujos de navegación
- ✅ Documentación de módulos (Auth, Cliente, Trainer, Admin)
- ✅ Reglas de desarrollo y Golden Rules
- ✅ Problemas conocidos y TODO

**Para agentes IA:** Lee únicamente `docs/MASTER.md` para entender el proyecto completo.

---

## 📋 Documentación por Módulos (Legacy)

> **Nota:** Estos archivos mantienen el detalle histórico pero están consolidados en MASTER.md.

| # | Documento | Descripción | Estado |
|---|-----------|-------------|--------|
| 00 | **`00_indice.md`** | Este archivo - Índice general | ✅ Activo |
| 01 | **`01_vision_y_requisitos.md`** | Visión del producto, objetivos y requisitos por rol | 📦 Consolidado en MASTER.md |
| 02 | **`02_arquitectura_y_datos.md`** | Stack, arquitectura, modelo de datos y reglas de seguridad | 📦 Consolidado en MASTER.md |
| 03 | **`03_design_system.md`** | Sistema de diseño UI, tokens, componentes y breakpoints | 📦 Consolidado en MASTER.md |
| 04 | **`04_flujos_navegacion.md`** | Rutas, flujos de navegación y redireccionamiento por rol | 📦 Consolidado en MASTER.md |
| 05 | **`05_modulo_autenticacion.md`** | Auth: login, registro, recover, stores, guards | 📦 Consolidado en MASTER.md |
| 06 | **`06_modulo_cliente.md`** | Módulo Cliente: Dashboard, rutinas, dietas, progreso, chat | 📦 Consolidado en MASTER.md |
| 07 | **`07_modulo_trainer.md`** | Módulo Trainer: Gestión clientes, creador planes, chat | 📦 Consolidado en MASTER.md |
| 08 | **`08_modulo_administracion.md`** | Módulo Admin: Control usuarios, trainers, clients, settings | 📦 Consolidado en MASTER.md |
| 09 | **`09_desarrollo_y_workflow.md`** | Setup, comandos y pautas para agentes IA | 📦 Consolidado en MASTER.md |
| 10 | **`10_todo_y_problemas.md`** | Plan de trabajo, checklist y problemas técnicos | 📦 Consolidado en MASTER.md |

---

## 📚 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| **`THEME.md`** | Sistema de temas light/dark con CSS variables y Nanostores |
| **`THEME_STATUS.md`** | Estado de migración del sistema de temas (41/44 archivos migrados) |
| **`ACCESIBILIDAD.md`** | Guía de cumplimiento WCAG 2.1 AA |
| **`UI_UX_FINAL_PLAN.md`** | Plan de optimización de motion system (7/34 páginas mejoradas) |
| **`UI_UX_MIGRATION_PLAN.md`** | Plan detallado de migración de componentes de carga |

---

## 🚀 Inicio Rápido

### Para Agentes IA
1. **Leer:** `docs/MASTER.md` (documentación completa)
2. **Leer:** `TODO.md` (lista de tareas pendientes)
3. **Implementar:** Siguiendo las reglas en sección 11 de MASTER.md

### Para Desarrolladores
1. **Setup:** Ver sección 11.3 de MASTER.md
2. **Arquitectura:** Ver sección 5 de MASTER.md
3. **Módulos:** Ver secciones 7-10 de MASTER.md

---

## 📊 Resumen del Proyecto

**CampFit** es una plataforma fitness que conecta clientes con entrenadores personales, permitiendo:
- 📋 Asignación y seguimiento de rutinas de entrenamiento
- 🥗 Planes de nutrición inteligentes
- 📈 Seguimiento de progreso (peso, fotos, RPE)
- 💬 Chat 1:1 entre cliente y entrenador
- ⚠️ Sistema de alertas y llamados de atención
- 📊 Panel de administración completo

**Roles:**
- 👤 **Cliente:** Sigue rutinas, registra progreso, se comunica con su trainer
- 🏋️ **Entrenador:** Gestiona clientes, crea planes, monitorea progreso
- ⚙️ **Administrador:** Control total de usuarios, contenido y configuración

---

## 🔗 Enlaces Útiles

- [Documentación de Astro](https://docs.astro.build)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Nanostores](https://github.com/nanostores/nanostores)
- [Repositorio GitHub](https://github.com/webPMI/campfit)

---

**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit  
**Versión:** 2.0