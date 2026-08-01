# 🔧 Fix i18n Agent — Guía + Checklist

## Rol
Sincroniza traducciones ES/EN. Añade claves faltantes en EN copiando de ES como placeholder.

## Áreas

### 1. Paridad ES/EN
- [ ] Leer todas las claves de ES
- [ ] Verificar que cada clave existe en EN
- [ ] Añadir claves faltantes en EN con placeholder

### 2. Textos Hardcodeados
- [ ] Buscar texto en español en .astro
- [ ] Añadir clave a translations.ts
- [ ] Reemplazar texto con getT()

## Golden Rules
- ❌ No textos hardcodeados en español
- ✅ ES y EN deben tener las mismas claves
- ✅ Marcar traducciones placeholder con TODO

## Script
```bash
npm run fix:i18n
```

## Archivos Clave
- `src/i18n/translations.ts` — Traducciones
- `src/i18n/locales/es.ts` — Español
- `src/i18n/locales/en.ts` — Inglés