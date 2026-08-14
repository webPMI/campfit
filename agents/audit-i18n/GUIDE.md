# 🌐 Audit i18n Agent — Guía + Checklist

## Rol
Auditor de internacionalización. Escanea paridad ES/EN, claves faltantes, textos hardcodeados.

## Áreas de Auditoría

### 1. Paridad de Traducciones
- [ ] Verificar que todas las claves ES tienen traducción EN
  - [ ] Subpaso: `grep -oP "^\s{2}\w+:" src/i18n/locales/es.ts | sort > /tmp/es_keys.txt`
  - [ ] Subpaso: `grep -oP "^\s{2}\w+:" src/i18n/locales/en.ts | sort > /tmp/en_keys.txt`
  - [ ] Subpaso: `comm -23 /tmp/es_keys.txt /tmp/en_keys.txt` — claves solo en ES
- [ ] Verificar que todas las claves EN tienen traducción ES
  - [ ] Subpaso: `comm -13 /tmp/es_keys.txt /tmp/en_keys.txt` — claves solo en EN
- [ ] Verificar paridad 1:1 entre idiomas
  - [ ] Subpaso: Comparar conteos: `wc -l /tmp/es_keys.txt` vs `wc -l /tmp/en_keys.txt`
  - [ ] Subpaso: Verificar que los conteos son iguales
- [ ] Reportar claves huérfanas (en un idioma pero no en el otro)
  - [ ] Subpaso: Anotar cada clave huérfana con su idioma
  - [ ] Subpaso: Asignar ID (ej: I18N-001) a cada hallazgo

### 2. Textos Hardcodeados
- [ ] Buscar texto en español directamente en HTML de .astro
  - [ ] Subpaso: `grep -rn ">[A-ZÁÉÍÓÚÑ][a-záéíóúñ]*" src/pages/ --include="*.astro" | grep -v "data-i18n"`
  - [ ] Subpaso: Anotar archivo, línea y texto hardcodeado
- [ ] Verificar que se usa `getT()` para textos dinámicos
  - [ ] Subpaso: `grep -rn "getT(\|t(" src/pages/ --include="*.astro" | head -20`
  - [ ] Subpaso: Verificar que los textos dinámicos usan la función de traducción
- [ ] Verificar que `translations.ts` tiene todas las claves usadas
  - [ ] Subpaso: `grep -rhoP "(?:getT|t)\('([^']+)'" src/pages/ --include="*.astro" | sed "s/.*'//" | sort -u > /tmp/used_keys.txt`
  - [ ] Subpaso: Verificar que cada clave usada existe en `es.ts` y `en.ts`
- [ ] Buscar strings literales en lugar de claves i18n
  - [ ] Subpaso: `grep -rn '"[A-Z][a-záéíóúñ]* [a-záéíóúñ]*"' src/pages/ --include="*.astro" | grep -v "class=\|href=\|data-\|aria-\|style="`
  - [ ] Subpaso: Anotar strings que deberían ser claves i18n

### 3. Estructura i18n
- [ ] Verificar que `translations.ts` está bien estructurado
  - [ ] Subpaso: Verificar que exporta `translations` con `es`, `en`, `ca`
  - [ ] Subpaso: Verificar que el tipo `Language` es `'es' | 'en' | 'ca'`
- [ ] Verificar que `client.ts` funciona correctamente
  - [ ] Subpaso: Verificar que `t()` tiene fallback a `'es'`
  - [ ] Subpaso: Verificar que `translateDOM()` usa MutationObserver
- [ ] Verificar que el idioma se persiste en localStorage
  - [ ] Subpaso: `grep -n "localStorage" src/i18n/client.ts`
  - [ ] Subpaso: Verificar key `campfit_lang` y cookie `cf_lang`
- [ ] Verificar que el LanguageSwitcher funciona
  - [ ] Subpaso: `grep -rn "LanguageSwitcher" src/components/ --include="*.astro"`
  - [ ] Subpaso: Verificar que usa clean URLs (sin `?lang=`)

### 4. Cobertura de Claves
- [ ] Verificar que onboarding tiene todas las claves en ambos idiomas
  - [ ] Subpaso: `grep -rn "onboarding\." src/i18n/locales/es.ts | wc -l` vs `en.ts`
- [ ] Verificar que admin tiene todas las claves en ambos idiomas
  - [ ] Subpaso: `grep -rn "admin\." src/i18n/locales/es.ts | wc -l` vs `en.ts`
- [ ] Verificar que trainer tiene todas las claves en ambos idiomas
  - [ ] Subpaso: `grep -rn "trainer\." src/i18n/locales/es.ts | wc -l` vs `en.ts`
- [ ] Verificar que client tiene todas las claves en ambos idiomas
  - [ ] Subpaso: `grep -rn "client\." src/i18n/locales/es.ts | wc -l` vs `en.ts`
  - [ ] Subpaso: Anotar cualquier módulo con conteos desiguales

## Script
```bash
node scripts/audit.mjs --area=i18n
```

## Archivos Clave
- `src/i18n/translations.ts` - Traducciones ES/EN
- `src/i18n/client.ts` - Cliente i18n
- `src/components/LanguageSwitcher.astro` - Switcher de idioma
- Todos los archivos `.astro` en `src/pages/`