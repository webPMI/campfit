# 🔧 Fix i18n Agent — Guía + Checklist

## Rol
Sincroniza traducciones ES/EN. Añade claves faltantes en EN copiando de ES como placeholder.

## Áreas

### 1. Paridad ES/EN
- [ ] Leer todas las claves de ES
  - [ ] Subpaso: `grep -oP "^\s{2}\w+:" src/i18n/locales/es.ts | sort > /tmp/es_keys.txt`
  - [ ] Subpaso: Contar claves: `wc -l /tmp/es_keys.txt`
- [ ] Verificar que cada clave existe en EN
  - [ ] Subpaso: `grep -oP "^\s{2}\w+:" src/i18n/locales/en.ts | sort > /tmp/en_keys.txt`
  - [ ] Subpaso: Comparar: `comm -23 /tmp/es_keys.txt /tmp/en_keys.txt` (claves solo en ES)
  - [ ] Subpaso: Verificar que el resultado está vacío o documentar las faltantes
- [ ] Añadir claves faltantes en EN con placeholder
  - [ ] Subpaso: Para cada clave faltante, añadir `clave: 'TODO: traducir',` en `en.ts`
  - [ ] Subpaso: Marcar con comentario `// TODO: traducir` para seguimiento
  - [ ] Subpaso: Verificar: `npm test -- translations` (debe pasar)

### 2. Textos Hardcodeados
- [ ] Buscar texto en español en .astro
  - [ ] Subpaso: `grep -rn ">[A-ZÁÉÍÓÚÑ][a-záéíóúñ]*" src/pages/ --include="*.astro" | grep -v "data-i18n"`
  - [ ] Subpaso: Filtrar textos que no sean atributos ni clases CSS
- [ ] Añadir clave a translations.ts
  - [ ] Subpaso: Añadir la clave en `es.ts` con el texto original
  - [ ] Subpaso: Añadir la clave en `en.ts` con la traducción
  - [ ] Subpaso: Añadir la clave en `ca.ts` si existe (o marcar TODO)
- [ ] Reemplazar texto con getT()
  - [ ] Subpaso: Reemplazar el texto hardcodeado con `{t("clave.nueva")}`
  - [ ] Subpaso: Añadir `data-i18n="clave.nueva"` para hidratación client-side
  - [ ] Subpaso: Verificar: `npm run i18n:check` (si existe) o `npm test -- translations`

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