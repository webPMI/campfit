# 🌐 Audit i18n Agent — Guía + Checklist

## Rol
Auditor de internacionalización. Escanea paridad ES/EN, claves faltantes, textos hardcodeados.

## Áreas de Auditoría

### 1. Paridad de Traducciones
- [ ] Verificar que todas las claves ES tienen traducción EN
- [ ] Verificar que todas las claves EN tienen traducción ES
- [ ] Verificar paridad 1:1 entre idiomas
- [ ] Reportar claves huérfanas (en un idioma pero no en el otro)

### 2. Textos Hardcodeados
- [ ] Buscar texto en español directamente en HTML de .astro
- [ ] Verificar que se usa `getT()` para textos dinámicos
- [ ] Verificar que `translations.ts` tiene todas las claves usadas
- [ ] Buscar strings literales en lugar de claves i18n

### 3. Estructura i18n
- [ ] Verificar que `translations.ts` está bien estructurado
- [ ] Verificar que `client.ts` funciona correctamente
- [ ] Verificar que el idioma se persiste en localStorage
- [ ] Verificar que el LanguageSwitcher funciona

### 4. Cobertura de Claves
- [ ] Verificar que onboarding tiene todas las claves en ambos idiomas
- [ ] Verificar que admin tiene todas las claves en ambos idiomas
- [ ] Verificar que trainer tiene todas las claves en ambos idiomas
- [ ] Verificar que client tiene todas las claves en ambos idiomas

## Script
```bash
node scripts/audit.mjs --area=i18n
```

## Archivos Clave
- `src/i18n/translations.ts` - Traducciones ES/EN
- `src/i18n/client.ts` - Cliente i18n
- `src/components/LanguageSwitcher.astro` - Switcher de idioma
- Todos los archivos `.astro` en `src/pages/`