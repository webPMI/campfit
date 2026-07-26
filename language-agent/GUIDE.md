# 🌐 Language Agent Guide

> **Guía completa para el Agente de Idioma IA** - Sistema de internacionalización (i18n) del proyecto CampFit. Diseñado para ser escalable, optimizado y libre de duplicaciones.

---

## 🎯 Rol y Objetivos

**Responsabilidades:**
- Mantener el sistema de traducciones ES/EN completo y sincronizado
- Detectar y corregir textos hardcodeados que deberían usar `t()`
- Eliminar duplicaciones de claves y valores repetidos
- Validar que todas las claves existan en ambos idiomas
- Generar reportes de estado del sistema i18n
- Optimizar el consumo de tokens evitando búsquedas innecesarias

**Objetivos de Calidad:**
- Cero textos hardcodeados visibles al usuario
- Cero claves faltantes en cualquiera de los dos idiomas
- Cero duplicación de valores entre traducciones
- 100% de cobertura de traducciones en páginas y componentes
- Sistema auto-documentado con scripts de validación

---

## 🏗️ Arquitectura del Sistema i18n

```
src/i18n/
├── types.ts              # Tipos compartidos (Language, TranslationKey, TranslationMap)
├── translations.ts       # 📦 TODAS las traducciones (server-side + client-side unificadas)
├── client.ts             # 🌐 Cliente i18n (persistencia localStorage, función t() client-side)
└── index.ts              # 📤 Barrel exports

scripts/
├── i18n-validate.sh      # ✅ Valida que todas las claves existan en ES y EN
├── i18n-find-missing.sh  # 🔍 Busca textos hardcodeados que deberían usar t()
├── i18n-dedup.sh         # ♻️ Encuentra claves duplicadas o valores repetidos
├── i18n-sync.sh          # 🔄 Sincroniza y optimiza el archivo de traducciones
└── i18n-report.sh        # 📊 Genera reporte completo del estado de i18n

language-agent/
├── GUIDE.md              # 👈 ESTE ARCHIVO
├── CHECKLIST.md          # ✅ Checklist operativo
├── RULES.md              # 📏 Reglas específicas de i18n
└── SCRIPTS.md            # 📖 Documentación de scripts
```

### Flujo de datos

```
Usuario selecciona idioma
        │
        ▼
  LanguageSwitcher.astro ───→ ?lang=es|en (URL param)
        │
        ▼
  getLanguage(urlLang) ───→ localStorage (persistencia)
        │
        ▼
  getT(urlLang) ───→ translations[lang][key] → string
        │
        ▼
  client.ts t(key) ───→ clientTranslations (subconjunto client-side)
```

---

## 📂 Estructura de Claves de Traducción

### Convención de Nombres

```
[ámbito].[subámbito].[clave]
```

| Ámbito | Subámbito | Ejemplo |
|--------|-----------|---------|
| `app` | - | `app.name`, `app.tagline` |
| `hero` | - | `hero.title`, `hero.cta` |
| `auth` | login/register/google | `auth.login.title`, `auth.google.login` |
| `error` | - | `error.invalid-credential`, `error.required` |
| `dashboard` | - | `dashboard.welcome`, `dashboard.logout` |
| `client` | nav/medical/stats/support | `client.nav.home`, `client.medical.save` |
| `trainer` | clients/workouts/diets/chat | `trainer.clients`, `trainer.workouts.create` |
| `admin` | users/settings/danger | `admin.users`, `admin.settings.danger` |
| `onboarding` | personal/medical/emergency | `onboarding.personal.title`, `onboarding.next` |
| `recover` | - | `recover.title`, `recover.btn` |
| `feature` | - | `feature.training`, `feature.coach` |

### Reglas de Nomenclatura

1. **Sin espacios**: Usar puntos (`.`) como separadores
2. **Sin mayúsculas**: Todo en minúsculas (excepto nombres propios como `Google`)
3. **Singular**: Preferir singular sobre plural (`client.nav.home` no `client.navs.home`)
4. **Jerárquico**: De lo general a lo específico (`auth.google.login` no `google.auth.login`)
5. **Consistente**: Misma estructura en ES y EN (mismas claves)

---

## 🔄 Flujo de Trabajo del Language Agent

### 1. Diagnóstico Inicial

```bash
# Verificar estado completo del sistema i18n
npm run i18n:report

# Validar que todas las claves existen en ES y EN
npm run i18n:validate

# Buscar textos hardcodeados
npm run i18n:find-missing
```

### 2. Análisis de Resultados

Revisar el reporte generado por `i18n:report`:
- **❌ Claves faltantes**: Añadir al archivo `translations.ts`
- **⚠️ Textos hardcodeados**: Reemplazar con `t('clave')`
- **♻️ Valores duplicados**: Optimizar usando claves compartidas
- **📦 Claves no usadas**: Considerar eliminación

### 3. Implementación de Cambios

```bash
# 1. Añadir nuevas traducciones a translations.ts
# 2. Reemplazar textos hardcodeados con t('clave')
# 3. Ejecutar validación
npm run i18n:validate

# 4. Verificar que no hay duplicados
npm run i18n:dedup

# 5. Sincronizar client.ts si es necesario
npm run i18n:sync
```

### 4. Verificación Final

```bash
# Reporte final
npm run i18n:report

# Validación completa del proyecto
bash scripts/validate.sh --quick
```

---

## 🛠️ Comandos Disponibles

```bash
# Diagnóstico y validación
npm run i18n:report           # Reporte completo del estado de i18n
npm run i18n:validate         # Validar claves ES/EN
npm run i18n:find-missing     # Buscar textos hardcodeados
npm run i18n:dedup            # Encontrar duplicados

# Mantenimiento
npm run i18n:sync             # Sincronizar client.ts con translations.ts
npm run i18n:fix              # Auto-fix de problemas detectados
```

---

## 📊 Interpretación de Reportes

### Formato del Reporte (`i18n:report`)

```
=== REPORTE i18n: translations.ts ===
📦 Total claves ES: 120
📦 Total claves EN: 120
✅ Claves sincronizadas: 120/120

=== CLAVES FALTANTES ===
❌ EN: auth.new.feature (presente en ES pero no en EN)
❌ ES: client.new.section (presente en EN pero no en ES)

=== TEXTOS HARDCODEADOS ===
⚠️ src/pages/admin/settings.astro:45 - "Guardar Cambios"
⚠️ src/pages/trainer/dashboard.astro:23 - "Trainer"

=== VALORES DUPLICADOS ===
♻️ 'Cerrar Sesión' aparece en:
   - admin.settings.logout
   - dashboard.logout
```

### Acciones por Tipo de Issue

| Issue | Acción |
|-------|--------|
| ❌ Clave faltante | Añadir traducción al idioma que falta |
| ⚠️ Texto hardcodeado | Reemplazar con `t('clave')` |
| ♻️ Valor duplicado | Considerar crear clave compartida |
| 📦 Clave no usada | Evaluar si eliminar (con cuidado) |

---

## 🧪 Testing del Sistema i18n

Los tests del sistema i18n están en:
- `tests/unit/lib/shared/i18n.test.ts` - Tests de `getLanguage()`, `getT()`, `setLanguage()`
- `tests/unit/i18n/translations.test.ts` - Tests de estructura de traducciones

### Lo que deben cubrir los tests:

1. **Estructura**: Mismas claves en ES y EN
2. **Valores**: No vacíos, no duplicados dentro del mismo idioma
3. **Funciones**: `t()` retorna valor correcto, fallback a ES, fallback a key
4. **Persistencia**: `getStoredLanguage()`, `setStoredLanguage()`, `toggleLanguage()`
5. **Detección**: `getLanguage()` con URL param, localStorage, navigator.language

---

## 📚 Referencias

- `CHECKLIST.md` - Checklist paso a paso para cada sesión
- `RULES.md` - Reglas específicas de i18n
- `SCRIPTS.md` - Documentación detallada de scripts
- `src/i18n/translations.ts` - Archivo principal de traducciones
- `src/i18n/client.ts` - Cliente i18n
- `src/i18n/types.ts` - Tipos compartidos
- `src/lib/shared/i18n.ts` - Utilidades compartidas
- `tests/unit/lib/shared/i18n.test.ts` - Tests existentes

---

> **Última actualización:** 2026-07-25  
> **Versión:** 1.0 - Sistema de Language Agent unificado