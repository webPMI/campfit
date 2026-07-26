# 📖 Language Agent Scripts

> **Documentación de scripts disponibles** - Herramientas para validar, sincronizar y mantener el sistema i18n de CampFit.

---

## 📋 Índice de Scripts

| Script | Propósito | Uso |
|--------|-----------|-----|
| `i18n-validate.sh` | Valida que todas las claves existan en ES y EN | `npm run i18n:validate` |
| `i18n-find-missing.sh` | Busca textos hardcodeados que deberían usar `t()` | `npm run i18n:find-missing` |
| `i18n-dedup.sh` | Encuentra claves duplicadas o valores repetidos | `npm run i18n:dedup` |
| `i18n-sync.sh` | Sincroniza client.ts con translations.ts | `npm run i18n:sync` |
| `i18n-report.sh` | Genera reporte completo del estado de i18n | `npm run i18n:report` |

---

## 🔧 Instalación y Configuración

### Permisos de Ejecución

```bash
# Dar permisos de ejecución a todos los scripts
chmod +x scripts/i18n-*.sh
```

### Variables de Entorno

No requieren variables de entorno especiales. Solo necesitan:
- Node.js >= 22.12.0
- jq (para procesamiento de JSON)
- grep, sed, awk (herramientas estándar de Unix)

### Verificar Instalación

```bash
# Verificar que los scripts existen
ls -la scripts/i18n-*.sh

# Verificar sintaxis
bash -n scripts/i18n-validate.sh
bash -n scripts/i18n-find-missing.sh
bash -n scripts/i18n-dedup.sh
bash -n scripts/i18n-sync.sh
bash -n scripts/i18n-report.sh
```

---

## 📊 Uso de Scripts

### 1. `i18n-validate.sh` - Validador de Traducciones

**Propósito:** Asegura que todas las claves existan en ambos idiomas (ES y EN).

**Uso:**
```bash
npm run i18n:validate
# o directamente
bash scripts/i18n-validate.sh
```

**Output esperado:**
```
✅ Validación exitosa: Todas las claves existen en ES y EN
📦 Total claves ES: 120
📦 Total claves EN: 120
```

**Output en caso de error:**
```
❌ Error: Claves faltantes detectadas

Faltantes en EN:
  - auth.new.feature
  - client.new.section

Faltantes en ES:
  - trainer.advanced.feature
```

**Cuándo usar:**
- Después de añadir nuevas traducciones
- Antes de cada commit
- En CI/CD pipeline
- Cuando se reportan traducciones faltantes

**Acción correctiva:**
1. Añadir claves faltantes a `src/i18n/translations.ts`
2. Añadir traducción en idioma que falta
3. Re-ejecutar validación

---

### 2. `i18n-find-missing.sh` - Buscador de Textos Hardcodeados

**Propósito:** Detecta textos hardcodeados en español/inglés que deberían usar la función `t()`.

**Uso:**
```bash
npm run i18n:find-missing
# o directamente
bash scripts/i18n-find-missing.sh
```

**Output esperado:**
```
⚠️ Textos hardcodeados detectados: 0
✅ No hay textos hardcodeados visibles al usuario
```

**Output en caso de hallazgos:**
```
⚠️ Textos hardcodeados detectados: 5

src/pages/admin/settings.astro:45
  "Guardar Cambios"
  → Usar: t('admin.settings.save')

src/pages/trainer/dashboard.astro:23
  "Trainer Dashboard"
  → Usar: t('trainer.dashboard')

src/components/ConfirmModal.astro:12
  "¿Estás seguro?"
  → Usar: t('modal.confirm')
```

**Exclusiones (no detecta):**
- Códigos y IDs técnicos
- Variables y placeholders (`{name}`, `{count}`)
- URLs y rutas
- Logs de consola
- Atributos HTML técnicos
- Nombres propios (CampFit, Google, Firebase)

**Cuándo usar:**
- Antes de cada commit
- En code review
- Cuando se añaden nuevas páginas/componentes
- Periódicamente para mantener limpieza

**Acción correctiva:**
1. Añadir traducción a `translations.ts`
2. Reemplazar texto hardcodeado con `{t('clave')}` (Astro) o `t('clave')` (JS)
3. Re-ejecutar búsqueda

---

### 3. `i18n-dedup.sh` - Detector de Duplicados

**Propósito:** Encuentra valores de traducción repetidos que se pueden optimizar.

**Uso:**
```bash
npm run i18n:dedup
# o directamente
bash scripts/i18n-dedup.sh
```

**Output esperado:**
```
✅ No hay duplicados innecesarios
📦 Total valores únicos: 120/120
```

**Output en caso de duplicados:**
```
♻️ Valores duplicados detectados: 3

'Cerrar Sesión' aparece en:
  - dashboard.logout
  - admin.settings.logout
  - trainer.settings.logout

'Guardar' aparece en:
  - client.medical.save
  - admin.settings.profile.save
```

**Cuándo usar:**
- Después de añadir muchas traducciones
- Cuando se optimiza el archivo de traducciones
- Periódicamente para mantener consistencia

**Acción correctiva:**
1. Evaluar si las claves se pueden consolidar
2. Si se consolidan, actualizar todas las referencias
3. Si no, documentar por qué son diferentes
4. Re-ejecutar detección

---

### 4. `i18n-sync.sh` - Sincronizador de client.ts

**Propósito:** Sincroniza `client.ts` con `translations.ts`, eliminando duplicación.

**Uso:**
```bash
npm run i18n:sync
# o directamente
bash scripts/i18n-sync.sh
```

**Output esperado:**
```
✅ Sincronización completada
📦 client.ts actualizado con 45 traducciones
🗑️ Eliminadas 75 traducciones duplicadas
```

**Qué hace:**
1. Lee todas las traducciones de `translations.ts`
2. Filtra solo las necesarias para client-side (si se especifica filtro)
3. Actualiza `client.ts` con las traducciones filtradas
4. Elimina duplicación

**Cuándo usar:**
- Después de modificar `translations.ts`
- Cuando se añaden nuevas traducciones usadas en client-side
- Para eliminar duplicación entre archivos

**Nota:** Actualmente `client.ts` mantiene su propio mapa. Este script lo sincroniza automáticamente.

---

### 5. `i18n-report.sh` - Generador de Reportes

**Propósito:** Genera un reporte completo del estado del sistema i18n.

**Uso:**
```bash
npm run i18n:report
# o directamente
bash scripts/i18n-report.sh
```

**Output:**
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
   - dashboard.logout
   - admin.settings.logout
   - trainer.settings.logout

=== ESTADÍSTICAS ===
📊 Cobertura ES: 100% (120/120)
📊 Cobertura EN: 98% (117/120)
📊 Textos hardcodeados: 2
📊 Duplicados: 1 grupo (3 valores)
```

**Cuándo usar:**
- Al inicio de cada sesión de trabajo
- Para diagnóstico completo
- Antes de releases
- En reportes de estado

---

## 🚀 Comandos Combinados

### Diagnóstico Completo

```bash
# Ejecutar todos los checks de una vez
npm run i18n:report

# O individualmente para más detalle
npm run i18n:validate
npm run i18n:find-missing
npm run i18n:dedup
```

### Mantenimiento Rápido

```bash
# Sincronizar y validar
npm run i18n:sync && npm run i18n:validate

# Validar y buscar hardcodeados
npm run i18n:validate && npm run i18n:find-missing
```

### Pre-commit Check

```bash
# Verificar todo antes de commit
npm run i18n:validate && npm run i18n:find-missing && npm run i18n:dedup
```

---

## 🔍 Interpretación de Resultados

### Códigos de Salida

| Código | Significado | Acción |
|--------|-------------|--------|
| 0 | ✅ Todo correcto | Proceder con commit |
| 1 | ❌ Errores encontrados | Corregir antes de commit |
| 2 | ⚠️ Warnings encontrados | Evaluar si corregir |

### Niveles de Severidad

| Icono | Severidad | Descripción | Acción |
|-------|-----------|-------------|--------|
| ❌ | CRÍTICA | Clave faltante en ES o EN | Añadir inmediatamente |
| ⚠️ | ALTA | Texto hardcodeado en página pública | Reemplazar con `t()` |
| ♻️ | MEDIA | Valor duplicado | Evaluar consolidación |
| 📦 | BAJA | Clave no usada | Considerar eliminación |

---

## 🛠️ Troubleshooting

### Script no se ejecuta

```bash
# Verificar permisos
ls -la scripts/i18n-*.sh

# Añadir permisos de ejecución
chmod +x scripts/i18n-*.sh

# Verificar sintaxis
bash -n scripts/i18n-validate.sh
```

### Falsos positivos en detección de hardcodeados

```bash
# Si el script detecta texto que no es hardcodeado:
# 1. Verificar la regex en i18n-find-missing.sh
# 2. Añadir exclusión si es necesario
# 3. Documentar la exclusión en RULES.md
```

### Validación falla por formato incorrecto

```bash
# Verificar que translations.ts tiene formato correcto:
# - TypeScript válido
# - Exporta type Language
# - Exporta const translations
# - Exporta function t()

# Verificar con type-check
npm run type-check
```

### Sincronización no funciona

```bash
# Verificar que translations.ts es válido
npm run type-check

# Verificar que client.ts tiene la estructura correcta
cat src/i18n/client.ts

# Ejecutar sync con verbose
bash scripts/i18n-sync.sh
```

---

## 📚 Referencias

- `GUIDE.md` - Arquitectura del sistema i18n
- `CHECKLIST.md` - Checklist operativo
- `RULES.md` - Reglas de cumplimiento
- `src/i18n/translations.ts` - Archivo de traducciones
- `src/i18n/client.ts` - Cliente i18n
- `tests/unit/lib/shared/i18n.test.ts` - Tests del sistema

---

## 🎓 Ejemplos de Uso

### Flujo de Trabajo Diario

```bash
# 1. Inicio del día - Diagnóstico
npm run i18n:report

# 2. Durante desarrollo - Validación continua
npm run i18n:validate

# 3. Antes de commit - Checks completos
npm run i18n:validate && npm run i18n:find-missing && npm run i18n:dedup

# 4. Después de cambios en translations.ts
npm run i18n:sync
```

### Flujo de Añadir Nueva Traducción

```bash
# 1. Añadir traducción en translations.ts
# 2. Validar que está en ambos idiomas
npm run i18n:validate

# 3. Usar en componente/página
# 4. Verificar que no hay hardcodeados
npm run i18n:find-missing

# 5. Sincronizar client.ts si es necesario
npm run i18n:sync
```

### Flujo de Code Review

```bash
# Revisar cambios de i18n
git diff src/i18n/

# Validar cambios
npm run i18n:validate

# Buscar hardcodeados en cambios
npm run i18n:find-missing

# Ver reporte completo
npm run i18n:report
```

---

## 🔄 Integración con package.json

Los scripts están disponibles como comandos npm:

```json
{
  "scripts": {
    "i18n:validate": "bash scripts/i18n-validate.sh",
    "i18n:find-missing": "bash scripts/i18n-find-missing.sh",
    "i18n:dedup": "bash scripts/i18n-dedup.sh",
    "i18n:sync": "bash scripts/i18n-sync.sh",
    "i18n:report": "bash scripts/i18n-report.sh",
    "i18n:fix": "bash scripts/i18n-fix.sh"
  }
}
```

---

## 📈 Métricas de Performance

### Tiempos de Ejecución (objetivo)

| Script | Tiempo objetivo | Tiempo máximo |
|--------|-----------------|---------------|
| `i18n:validate` | <1s | <2s |
| `i18n:find-missing` | <5s | <10s |
| `i18n:dedup` | <1s | <2s |
| `i18n:sync` | <1s | <2s |
| `i18n:report` | <2s | <5s |

### Optimización

Si los scripts son lentos:
1. Verificar que no hay archivos de traducción muy grandes (>300 líneas)
2. Optimizar regex en `i18n-find-missing.sh`
3. Cachear resultados en `i18n-report.sh`

---

> **Última actualización:** 2026-07-25  
> **Versión:** 1.0 - Documentación de scripts i18n