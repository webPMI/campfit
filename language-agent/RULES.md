# 📏 Language Agent Rules

> **Reglas específicas del sistema i18n** - Normas obligatorias para mantener la calidad y consistencia de las traducciones en CampFit.

---

## 🥇 Golden Rules de i18n

### ❌ NUNCA HACER ESTO

1. **No hardcodear textos visibles al usuario**
   - ❌ `<h1>Bienvenido</h1>`
   - ✅ `<h1>{t('welcome.title')}</h1>`

2. **No duplicar traducciones entre idiomas**
   - ❌ Tener `client.ts` con su propio mapa de traducciones
   - ✅ `client.ts` importa de `translations.ts` y filtra solo lo necesario

3. **No dejar claves sin traducción en ninguno de los dos idiomas**
   - ❌ Clave existe en ES pero no en EN
   - ✅ Todas las claves deben existir en ES y EN

4. **No usar valores vacíos o placeholder como traducción final**
   - ❌ `'auth.login.title': ''`
   - ✅ `'auth.login.title': 'Iniciar Sesión'`

5. **No mezclar idiomas en una misma traducción**
   - ❌ `'welcome': 'Welcome usuario'`
   - ✅ `'welcome': 'Welcome'` + nombre dinámico separado

6. **No crear claves duplicadas con el mismo valor**
   - ❌ `'dashboard.logout': 'Cerrar Sesión'` y `'admin.logout': 'Cerrar Sesión'`
   - ✅ Usar la misma clave o crear clave compartida

7. **No modificar claves existentes sin actualizar todas las referencias**
   - ❌ Cambiar `'auth.login'` por `'auth.signin'` sin actualizar usos
   - ✅ Buscar todas las referencias antes de renombrar

8. **No agregar traducciones en archivos incorrectos**
   - ❌ Agregar traducción en `client.ts` en lugar de `translations.ts`
   - ✅ Todas las traducciones en `translations.ts`

9. **No usar traducciones para contenido dinámico de base de datos**
   - ❌ Guardar `'Bienvenido ${nombre}'` en traducciones
   - ✅ Guardar `'Bienvenido'` y concatenar `${nombre}` dinámicamente

10. **No olvidar actualizar los scripts después de cambios estructurales**
    - ❌ Cambiar estructura de `translations.ts` sin actualizar `i18n-validate.sh`
    - ✅ Actualizar scripts para reflejar nueva estructura

---

## ✅ SIEMPRE HACER ESTO

1. **Mantener sincronización perfecta entre ES y EN**
   - Mismas claves en ambos idiomas
   - Mismo orden y agrupación
   - Misma estructura de comentarios

2. **Usar convención de nomenclatura consistente**
   - Formato: `[ámbito].[subámbito].[clave]`
   - Minúsculas, sin espacios, puntos como separadores
   - Ejemplos: `auth.login.title`, `client.nav.home`, `error.required`

3. **Agrupar traducciones por sección con comentarios**
   ```typescript
   es: {
     // Auth
     'auth.login.title': 'Iniciar Sesión',
     'auth.register.title': 'Crear Cuenta',
     
     // Errors
     'error.required': 'Completa todos los campos',
   }
   ```

4. **Ejecutar validación después de cada cambio**
   ```bash
   npm run i18n:validate
   npm run i18n:find-missing
   ```

5. **Mantener `client.ts` como subconjunto filtrado**
   - Solo incluir traducciones usadas en client-side JS
   - Importar desde `translations.ts`, no duplicar
   - Actualizar con `npm run i18n:sync`

6. **Documentar traducciones complejas o contextuales**
   - Agregar comentarios si una traducción requiere contexto
   - Usar variables para contenido dinámico: `'welcome': 'Bienvenido, {name}'`

7. **Priorizar páginas públicas y auth para traducción**
   - Páginas públicas (index, login, register) → Primero
   - Auth y errores → Crítico
   - Dashboards → Importante
   - Secciones internas → Después

8. **Usar fallbacks apropiados**
   - Si una clave no existe en EN, usar ES
   - Si una clave no existe en ningún idioma, mostrar la key
   - Nunca mostrar texto vacío o `undefined`

9. **Mantener archivos de traducción organizados**
   - `translations.ts` < 300 líneas (refactorizar si es necesario)
   - Agrupar por secciones con comentarios
   - Orden alfabético dentro de cada sección

10. **Actualizar documentación cuando cambie la estructura**
    - Actualizar `GUIDE.md` si cambia arquitectura
    - Actualizar `SCRIPTS.md` si cambian comandos
    - Actualizar `RULES.md` si se añaden nuevas reglas

---

## 📋 Reglas por Contexto

### Páginas Públicas (index, login, register, recover)

- **Prioridad**: CRÍTICA
- **Idiomas**: ES y EN obligatorios
- **Validación**: Debe pasar `i18n:validate` sin errores
- **Textos hardcodeados**: 0 permitidos

### Dashboards (client, trainer, admin)

- **Prioridad**: ALTA
- **Idiomas**: ES y EN obligatorios
- **Validación**: Debe pasar `i18n:validate` sin errores
- **Textos hardcodeados**: Máximo 0 (solo excepciones documentadas)

### Componentes Reutilizables

- **Prioridad**: ALTA
- **Idiomas**: ES y EN obligatorios
- **Validación**: Debe pasar `i18n:validate` sin errores
- **Textos hardcodeados**: 0 permitidos

### Scripts y Servicios (client-side JS)

- **Prioridad**: MEDIA
- **Idiomas**: ES y EN obligatorios para mensajes al usuario
- **Validación**: Usar `t()` de `client.ts`
- **Textos hardcodeados**: Solo para logs internos (no visibles al usuario)

### Mensajes de Error de Firebase

- **Prioridad**: CRÍTICA
- **Idiomas**: ES y EN obligatorios
- **Validación**: Todos los códigos de error deben tener traducción
- **Formato**: Usar prefijo `error.` + código Firebase sin slashes
  - Ejemplo: `auth/invalid-credential` → `error.invalid-credential`

---

## 🔍 Reglas de Validación

### Estructura de Traducciones

```typescript
// ✅ CORRECTO
export type Language = 'es' | 'en';

export const translations: Record<Language, Record<string, string>> = {
  es: {
    'app.name': 'CampFit',
    'auth.login.title': 'Iniciar Sesión',
  },
  en: {
    'app.name': 'CampFit',
    'auth.login.title': 'Sign In',
  },
};

export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] || translations['es']?.[key] || key;
}
```

### Clientes i18n

```typescript
// ✅ CORRECTO - Importar de translations.ts
import { translations, type Language } from '@/i18n/translations';

const clientTranslations: Record<Language, Record<string, string>> = {
  es: translations.es,
  en: translations.en,
};

export function t(key: string): string {
  const lang = getStoredLanguage();
  return clientTranslations[lang]?.[key] || clientTranslations['es']?.[key] || key;
}
```

### Uso en Componentes Astro

```astro
---
// ✅ CORRECTO
import { translations, type Language } from '@/i18n/translations';

const lang = (Astro.url.searchParams.get('lang') as Language) || 'es';
const t = (key: string) => translations[lang]?.[key] || translations['es']?.[key] || key;
---

<h1>{t('app.name')}</h1>
<p>{t('hero.description')}</p>
```

### Uso en Scripts JS/TS

```typescript
// ✅ CORRECTO
import { t } from '@/i18n/client';

const errorMessage = t('error.required');
showError(errorMessage);
```

---

## 🚫 Reglas de Excepción

### Textos que NO requieren traducción

1. **Códigos y IDs técnicos**
   - `user.uid`, `workout.id`, `message.timestamp`
   - No son visibles al usuario final

2. **Variables y placeholders**
   - `{name}`, `{count}`, `{date}`
   - Son interpolaciones, no texto final

3. **URLs y rutas**
   - `/admin/dashboard`, `/client/workouts`
   - Son rutas internas, no texto visible

4. **Logs de consola (solo desarrollo)**
   - `console.log('Debug:', data)`
   - No son visibles al usuario en producción

5. **Atributos técnicos HTML**
   - `type="email"`, `autocomplete="current-password"`
   - No son texto visible

### Cuando SÍ se permite hardcodear

1. **Nombres propios de marca**
   - `CampFit`, `Google`, `Firebase`
   - Son nombres comerciales, no se traducen

2. **Códigos de error técnicos en logs**
   - `auth/invalid-credential` en consola
   - Solo en logs, no en UI

3. **Placeholders temporales durante desarrollo**
   - Marcar con TODO: `// TODO: añadir traducción`
   - Eliminar antes de commit

---

## 📊 Métricas de Cumplimiento

### Límites Estrictos

| Métrica | Límite | Acción si se excede |
|---------|--------|---------------------|
| Claves faltantes (ES o EN) | 0 | Bloquear commit |
| Textos hardcodeados en páginas públicas | 0 | Bloquear commit |
| Duplicados innecesarios | 0 | Revisar y optimizar |
| Tamaño de translations.ts | <300 líneas | Refactorizar |
| Tamaño de client.ts | <200 líneas | Refactorizar |

### Monitoreo Continuo

```bash
# Ejecutar en cada sesión de desarrollo
npm run i18n:validate  # Debe retornar 0 errores
npm run i18n:find-missing  # Debe retornar 0 hallazgos (o solo excepciones)
npm run i18n:dedup  # Debe retornar 0 duplicados innecesarios
```

---

## 🛠️ Herramientas de Cumplimiento

### Scripts de Validación

```bash
# Validación completa
npm run i18n:validate

# Búsqueda de hardcodeados
npm run i18n:find-missing

# Detección de duplicados
npm run i18n:dedup

# Reporte completo
npm run i18n:report

# Sincronización
npm run i18n:sync
```

### Pre-commit Hook (recomendado)

```bash
# Añadir a .git/hooks/pre-commit o usar husky
npm run i18n:validate || exit 1
npm run i18n:find-missing || exit 1
```

### CI/CD Integration

```yaml
# En .github/workflows/ci.yml
- name: Validate i18n
  run: |
    npm run i18n:validate
    npm run i18n:find-missing
    npm run i18n:dedup
```

---

## 📚 Referencias

- `GUIDE.md` - Arquitectura y flujo de trabajo
- `CHECKLIST.md` - Checklist operativo
- `SCRIPTS.md` - Documentación de scripts
- `src/i18n/translations.ts` - Archivo principal de traducciones
- `src/i18n/client.ts` - Cliente i18n
- `src/i18n/types.ts` - Tipos compartidos
- `tests/unit/lib/shared/i18n.test.ts` - Tests del sistema i18n

---

## 🎓 Ejemplos de Cumplimiento

### ✅ Ejemplo Correcto

```typescript
// translations.ts
export type Language = 'es' | 'en';

export const translations: Record<Language, Record<string, string>> = {
  es: {
    'auth.login.title': 'Iniciar Sesión',
    'auth.login.btn': 'Entrar',
    'error.required': 'Completa todos los campos',
  },
  en: {
    'auth.login.title': 'Sign In',
    'auth.login.btn': 'Sign In',
    'error.required': 'Please fill in all fields',
  },
};

export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] || translations['es']?.[key] || key;
}
```

```astro
<!-- Componente Astro -->
---
import { translations, type Language } from '@/i18n/translations';

const lang = (Astro.url.searchParams.get('lang') as Language) || 'es';
const t = (key: string) => translations[lang]?.[key] || translations['es']?.[key] || key;
---

<h2>{t('auth.login.title')}</h2>
<button>{t('auth.login.btn')}</button>
```

### ❌ Ejemplo Incorrecto

```astro
<!-- ❌ MAL - Texto hardcodeado -->
<h2>Iniciar Sesión</h2>
<button>Entrar</button>

<!-- ❌ MAL - Clave faltante en EN -->
const translations = {
  es: { 'auth.login.title': 'Iniciar Sesión' },
  en: { /* Falta esta clave */ },
};

<!-- ❌ MAL - Duplicación en client.ts -->
const clientTranslations = {
  es: { 'auth.login.title': 'Iniciar Sesión' }, // Duplicado
  en: { 'auth.login.title': 'Sign In' }, // Duplicado
};
```

---

> **Última actualización:** 2026-07-25  
> **Versión:** 1.0 - Reglas de cumplimiento i18n