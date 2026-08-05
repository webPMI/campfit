# 🌐 Análisis de Arquitectura i18n — CampFit

> **Fecha:** 2026-07-31 | **Agentes:** audit-i18n | **Findings:** 61 textos hardcodeados

## Arquitectura Actual

```
src/i18n/
├── translations.ts    # Server-side: t(key, lang) — 14 líneas
├── client.ts          # Client-side: t(key) — 274 líneas (⚠️ duplicado)
├── locales/
│   ├── es.ts          # 500 líneas / ~170 claves
│   ├── en.ts          # 504 líneas / ~170 claves
│   └── ca.ts          # Catalan (nuevo, sin usar)
└── types.ts           # TranslationMap interface
```

## 🔴 Problemas Detectados

### 1. Duplicación de Traducciones
- **client.ts** tiene ~140 entradas propias (auth, errors, dashboard, client, admin, common)
- **locales/es.ts** y **locales/en.ts** tienen ~170 claves (global, index, features, etc.)
- **NO hay solapamiento** — son sistemas independientes
- Impacto: ~140 entradas mantenidas manualmente en dos lugares

### 2. Tres APIs de Traducción Diferentes
| API | Archivo | Uso |
|-----|---------|-----|
| `t(key, lang)` | `translations.ts` | Server-side (Astro frontmatter) |
| `t(key)` | `client.ts` | Client-side (scripts) |
| `getT(lang?)` | `lib/shared/i18n.ts` | Páginas admin legacy |

### 3. 61 Textos Hardcodeados en Español
| Sección | Cantidad | Archivos |
|---------|----------|----------|
| Trainer | 45 | diets, workouts, clients, chat, clinical, dashboard |
| Admin | 8 | users, devtools |
| Client | 5 | dashboard, medical-profile |
| Otros | 3 | settings, onboarding |

### 4. Sistema de Cambio de Idioma con URL Params
- `LanguageSwitcher.astro` usa `?lang=es/en` en URL
- `LanguageSwitcherDropdown.astro` también
- Esto genera recarga de página completa
- localStorage (`campfit_lang`) existe pero no es la fuente primaria

## 📊 Cobertura de Traducciones

| Conjunto | ES | EN | Diferencia |
|----------|-----|-----|------------|
| locales/ | ~170 | ~170 | ✅ Paridad |
| client.ts | ~140 | ~140 | ✅ Paridad |
| Hardcoded | ~61 | 0 | ❌ Sin traducción |

## 🎯 Plan de Implementación

### Fase 1: Unificar Fuentes de Traducción
- [ ] Mover client.ts → locales/es.ts y locales/en.ts
- [ ] Eliminar client.ts (solo wrapper)
- [ ] Unificar `t()` en un solo archivo

### Fase 2: Centralizar i18n en `src/i18n/index.ts`
- [ ] Único punto de entrada: `import { t, getLang } from '@/i18n'`
- [ ] Eliminar `lib/shared/i18n.ts`

### Fase 3: Añadir las 61 Claves Faltantes
- [ ] Agregar claves trainer.* en ES/EN
- [ ] Reemplazar hardcoded → `t('trainer.xxx')`
- [ ] Verificar build

### Fase 4: Unificar Sistema de Idioma
- [ ] localStorage como fuente única
- [ ] Eliminar URL params
- [ ] Recarga suave sin página completa

## 📝 Registro de Cambios

| Fecha | Fase | Acción | Resultado |
|-------|------|--------|-----------|
| 2026-07-31 | Análisis | Documentar arquitectura actual | Este doc |
| — | — | — | — |