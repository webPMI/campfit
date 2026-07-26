# ✅ Language Agent Checklist

> **Checklist operativo para el Agente de Idioma IA** - Sistema de internacionalización (i18n) del proyecto CampFit.

---

## 📋 Pre-Task Setup

- [ ] Leer `GUIDE.md` para refresh de arquitectura y comandos
- [ ] Leer `RULES.md` para reglas específicas de i18n
- [ ] Leer `SCRIPTS.md` para documentación de scripts disponibles
- [ ] Verificar que no hay otro agente trabajando: `bash scripts/agent-lock.sh check`
- [ ] Adquirir lock: `bash scripts/agent-lock.sh acquire "language-agent" "i18n-task"`
- [ ] Hacer pull: `git pull origin master --allow-unrelated-histories --no-edit`
- [ ] Verificar estado del proyecto: `npm run doctor`

---

## 🔍 Diagnóstico Inicial

### 1. Reporte Completo del Sistema
- [ ] Ejecutar: `npm run i18n:report`
- [ ] Revisar output y guardar reporte
- [ ] Identificar issues críticos (claves faltantes, textos hardcodeados)

### 2. Validación de Traducciones
- [ ] Ejecutar: `npm run i18n:validate`
- [ ] Verificar que no hay claves faltantes en ES o EN
- [ ] Si hay faltantes, anotar para añadir

### 3. Búsqueda de Textos Hardcodeados
- [ ] Ejecutar: `npm run i18n:find-missing`
- [ ] Revisar lista de textos hardcodeados
- [ ] Clasificar por prioridad (páginas públicas > páginas privadas)

### 4. Detección de Duplicados
- [ ] Ejecutar: `npm run i18n:dedup`
- [ ] Identificar valores repetidos que se pueden optimizar
- [ ] Decidir si consolidar en una clave compartida

---

## 📝 Análisis y Planificación

### Evaluación de Issues
- [ ] **Claves faltantes**: Listar y priorizar
  - [ ] Críticas (páginas públicas, auth, errores)
  - [ ] Medias (dashboard, navegación)
  - [ ] Bajas (secciones menos usadas)
- [ ] **Textos hardcodeados**: Listar archivos y líneas
  - [ ] Priorizar por visibilidad al usuario
  - [ ] Agrupar por página/componente
- [ ] **Duplicados**: Evaluar si consolidar
  - [ ] Mismo valor en claves diferentes → ¿Compartir clave?
  - [ ] Considerar impacto en mantenibilidad

### Plan de Implementación
- [ ] Crear checklist específica para la sesión
- [ ] Definir orden de trabajo:
  1. Añadir claves faltantes a `translations.ts`
  2. Reemplazar textos hardcodeados con `t('clave')`
  3. Eliminar duplicados si aplica
  4. Sincronizar `client.ts`
  5. Validar todo

---

## 🛠️ Implementación

### Añadir Traducciones Faltantes
- [ ] Abrir `src/i18n/translations.ts`
- [ ] Añadir claves faltantes en sección `es:`
- [ ] Añadir claves faltantes en sección `en:`
- [ ] Mantener orden alfabético dentro de cada sección
- [ ] Mantener comentarios de agrupación

### Reemplazar Textos Hardcodeados
- [ ] Por cada texto hardcodeado detectado:
  - [ ] Elegir clave apropiada (seguir convención de nomenclatura)
  - [ ] Añadir traducción ES y EN a `translations.ts`
  - [ ] Reemplazar texto hardcodeado con `{t('clave')}` (Astro) o `t('clave')` (JS)
  - [ ] Verificar que el texto se renderiza correctamente
- [ ] Ejecutar servidor de desarrollo para verificar: `npm run dev`

### Optimizar Duplicados (Opcional)
- [ ] Identificar valores duplicados que se repiten >3 veces
- [ ] Decidir si consolidar en clave compartida
- [ ] Actualizar referencias si se consolida
- [ ] Ejecutar `npm run i18n:dedup` para verificar

### Sincronizar client.ts
- [ ] Ejecutar: `npm run i18n:sync`
- [ ] Verificar que `client.ts` se actualizó correctamente
- [ ] Revisar que no hay traducciones innecesarias en client-side

---

## ✅ Verificación y Testing

### Validación Completa
- [ ] Ejecutar: `npm run i18n:validate`
  - [ ] Verificar 0 errores
  - [ ] Verificar que todas las claves existen en ES y EN
- [ ] Ejecutar: `npm run i18n:find-missing`
  - [ ] Verificar 0 textos hardcodeados (o solo los permitidos)
- [ ] Ejecutar: `npm run i18n:dedup`
  - [ ] Verificar que no hay duplicados innecesarios
- [ ] Ejecutar: `npm run i18n:report`
  - [ ] Verificar que el reporte está limpio

### Testing Funcional
- [ ] Iniciar servidor: `npm run dev`
- [ ] Probar cambio de idioma en página principal
- [ ] Probar cambio de idioma en login/register
- [ ] Probar cambio de idioma en dashboard (client/trainer/admin)
- [ ] Verificar que localStorage persiste el idioma
- [ ] Verificar que URL param `?lang=` funciona
- [ ] Recargar página y verificar que idioma se mantiene

### Validación del Proyecto
- [ ] Ejecutar: `bash scripts/validate.sh --quick`
  - [ ] Type-check pasa
  - [ ] Tests pasan
  - [ ] Lint pasa
  - [ ] Build pasa

---

## 📊 Métricas de Calidad

### Cobertura de Traducciones
- [ ] Total claves en ES: ___ (objetivo: >100)
- [ ] Total claves en EN: ___ (objetivo: >100)
- [ ] Claves sincronizadas: ___/___ (objetivo: 100%)
- [ ] Páginas con traducciones: ___/___ (objetivo: 100%)

### Calidad de Código
- [ ] Textos hardcodeados: ___ (objetivo: 0)
- [ ] Claves faltantes: ___ (objetivo: 0)
- [ ] Duplicados innecesarios: ___ (objetivo: 0)
- [ ] Archivos modificados: ___ (límite: 10 por commit)

### Performance
- [ ] Tamaño de `translations.ts`: ___ KB (objetivo: <50KB)
- [ ] Tamaño de `client.ts`: ___ KB (objetivo: <10KB)
- [ ] Tiempo de validación: ___s (objetivo: <5s)

---

## 🚀 Commit y Push

### Pre-Commit
- [ ] Verificar cambios: `git status`
- [ ] Verificar diff: `git diff src/i18n/`
- [ ] Verificar que no hay archivos innecesarios modificados
- [ ] Ejecutar validación final: `bash scripts/validate.sh --quick`

### Commit
- [ ] Staging de archivos: `git add src/i18n/ scripts/ language-agent/`
- [ ] Commit con formato:
  ```bash
  git commit -m "feat(i18n): implementar Language Agent system

  - Crear language-agent/ con GUIDE, CHECKLIST, RULES, SCRIPTS
  - Añadir scripts de validación (validate, find-missing, dedup, sync, report)
  - Refactorizar client.ts para eliminar duplicación
  - Añadir types.ts e index.ts para barrel exports
  - Actualizar package.json con scripts npm
  - Actualizar AGENTS.md y AGENTS_GUIDE.md
  
  Claves añadidas: X
  Textos hardcodeados corregidos: Y
  Duplicados eliminados: Z"
  ```
- [ ] Push: `git push origin master`

### Post-Commit
- [ ] Liberar lock: `bash scripts/agent-lock.sh release`
- [ ] Actualizar `language-agent/TASK_PROGRESS.md` (si existe)
- [ ] Documentar lecciones aprendidas en `language-agent/LESSONS.md` (si existe)

---

## 📈 Post-Task

### Monitoreo
- [ ] Verificar que CI/CD pasa
- [ ] Verificar que no hay textos hardcodeados en siguientes commits
- [ ] Monitorear tamaño de archivos de traducción

### Mejora Continua
- [ ] Identificar patrones de claves que se repiten
- [ ] Crear convenciones adicionales si es necesario
- [ ] Actualizar `GUIDE.md` si se encontraron mejores prácticas
- [ ] Actualizar `SCRIPTS.md` si se crearon nuevos scripts

---

## 🎯 Métricas de Éxito

### Calidad
- [ ] 0 textos hardcodeados visibles al usuario
- [ ] 0 claves faltantes en ES o EN
- [ ] 0 duplicados innecesarios
- [ ] 100% sincronización ES/EN

### Cobertura
- [ ] >100 claves de traducción
- [ ] 100% páginas con soporte de idioma
- [ ] 100% componentes con traducciones

### Performance
- [ ] Validación completa <5s
- [ ] Reporte completo <2s
- [ ] Búsqueda de hardcodeados <10s

---

## ⚠️ Troubleshooting

### Scripts no funcionan
- [ ] Verificar que tienen permisos de ejecución: `chmod +x scripts/i18n-*.sh`
- [ ] Verificar que están en la raíz del proyecto: `ls scripts/i18n-*.sh`
- [ ] Verificar sintaxis: `bash -n scripts/i18n-validate.sh`

### Validación falla con falsos positivos
- [ ] Revisar regex en scripts (pueden detectar falsos positivos)
- [ ] Añadir excepciones en `i18n-find-missing.sh` si es necesario
- [ ] Verificar que no hay textos en código JS que no son UI

### Duplicados detectados pero no se pueden eliminar
- [ ] Evaluar si realmente son duplicados o son contextos diferentes
- [ ] Considerar crear claves más específicas en lugar de compartir
- [ ] Documentar la decisión en `RULES.md`

### Cliente i18n no sincroniza
- [ ] Verificar que `client.ts` importa desde `translations.ts`
- [ ] Verificar que `clientTranslations` es un subconjunto filtrado
- [ ] Ejecutar `npm run i18n:sync` nuevamente
- [ ] Verificar que no hay errores de sintaxis en `translations.ts`

---

## 📚 Referencias Rápidas

```bash
# Comandos principales
npm run i18n:report           # Reporte completo
npm run i18n:validate         # Validar claves
npm run i18n:find-missing     # Buscar hardcodeados
npm run i18n:dedup            # Detectar duplicados
npm run i18n:sync             # Sincronizar client.ts
npm run i18n:fix              # Auto-fix (si existe)

# Utilidades
bash scripts/validate.sh --quick  # Validación completa
npm run dev                      # Servidor de desarrollo
npm test                         # Tests unitarios
```

```typescript
// Patrones de uso
import { t } from '@/i18n/client';           // Client-side
import { getT } from '@/lib/shared/i18n';    // Server-side
import { translations, type Language } from '@/i18n/translations'; // Directo

// Uso en Astro
const lang = (Astro.url.searchParams.get('lang') as Language) || 'es';
const t = (key: string) => translations[lang]?.[key] || translations['es']?.[key] || key;

// Uso en JS
const message = t('error.required');
```

---

## 🎓 Ejemplos de Uso

### Añadir Nueva Traducción
```typescript
// 1. En translations.ts, añadir en sección es:
'nueva.seccion.clave': 'Texto en español',

// 2. En translations.ts, añadir en sección en:
'nueva.seccion.clave': 'Text in English',

// 3. En componente/página:
<p>{t('nueva.seccion.clave')}</p>
```

### Reemplazar Texto Hardcodeado
```astro
<!-- ❌ ANTES -->
<h1>Bienvenido a CampFit</h1>

<!-- ✅ DESPUÉS -->
<h1>{t('app.name')}</h1>
```

### Consolidar Duplicados
```typescript
// ❌ ANTES - Duplicado
'dashboard.logout': 'Cerrar Sesión',
'admin.settings.logout': 'Cerrar Sesión',

// ✅ DESPUÉS - Compartir clave
'dashboard.logout': 'Cerrar Sesión',
'admin.settings.logout': 'Cerrar Sesión', // O usar la misma clave si el contexto lo permite
```

---

> **Última actualización:** 2026-07-25  
> **Versión:** 1.0 - Checklist operativo del Language Agent