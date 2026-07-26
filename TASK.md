# Tarea Actual

> **Última actualización:** 2026-07-25

---

## Tarea: Integración del Sistema de Agentes Especializados

**Prioridad:** 🔴 Alta
**Estado:** 🔄 En progreso

### Descripción
Completar la integración del sistema de 9 agentes especializados. El sistema ya está creado (agents/, language-agent/, testing-agent/) con GUIDE, RULES, CHECKLIST y TASKS para cada rol. Pendiente: instalar ESLint, verificar tests de authStore, actualizar documentación raíz.

### Criterios de aceptación
- [x] agents/__master.md creado y funcional
- [x] 7 agentes nuevos creados (Theme, Client, Admin, Trainer, Auth, Infra, Planner)
- [x] 2 agentes legacy (Language, Testing) referenciados
- [x] .clinerules actualizado (Astro 5 → 7, estructura src/, referencia agents/)
- [x] translations.ts: onboarding EN completado (~38 claves)
- [x] .env.example completado (ASTRO_SITE, ASTRO_BASE_URL, PUBLIC_API_URL, etc.)
- [x] AGENTS_GUIDE.md con sección de agentes especializados
- [x] AGENTS.md actualizado con tabla de agentes
- [x] Tests authStore expandidos (16 tests)
- [ ] ESLint instalado en package.json (INFRA-001)
- [ ] Icon.astro creado y layouts migrados (Theme #12)

### Próxima tarea sugerida
Instalar ESLint con `npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-astro`