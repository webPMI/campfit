# ✅ Mobile Agent — Checklist Operativo

> Checklist paso a paso para cada sesión de trabajo del agente multiplataforma.

---

## 🔄 Pre-Sesión

- [ ] Leer `agents/__master.md` para entender el ecosistema
- [ ] Leer `agents/mobile-agent/GUIDE.md` si es primera vez
- [ ] Revisar `agents/mobile-agent/TASKS.md` para prioridades
- [ ] Revisar problemas conocidos (MOBILE-001 a MOBILE-004)
- [ ] Ejecutar `npm run doctor`
- [ ] Verificar `bash scripts/agent-lock.sh check`

---

## 💻 Desarrollo PWA

- [ ] Identificar qué archivo PWA modificar (manifest, sw, iconos)
- [ ] Hacer cambio atómico (UN solo cambio)
- [ ] Verificar tipos: `npm run type-check`
- [ ] Ejecutar tests PWA: `npx vitest run tests/unit/pwa/pwa.test.ts`
- [ ] Build exitoso: `npm run build`
- [ ] Verificar que `dist/` contiene `manifest.json`, `sw.js` e iconos

---

## 💻 Desarrollo Capacitor (fase 2)

- [ ] Verificar que `npm run build` genera `dist/` correctamente
- [ ] Ejecutar `npx cap sync` para sincronizar con plataformas
- [ ] Verificar que `android/` y `ios/` están actualizados
- [ ] Probar en emulador: `npx cap open android` / `npx cap open ios`

---

## ✅ Validación

- [ ] `npm run type-check` (sin errores)
- [ ] `npx vitest run tests/unit/pwa/pwa.test.ts` (14 tests pasan)
- [ ] `npm run build` (build exitoso, 34 páginas)
- [ ] `dist/manifest.json` existe y es válido
- [ ] `dist/sw.js` existe
- [ ] `dist/pwa-icon-192.png` y `dist/pwa-icon-512.png` existen
- [ ] Commit con mensaje descriptivo

---

## 📤 Post-Sesión

- [ ] `bash scripts/validate.sh --quick`
- [ ] `git add -A && git commit`
- [ ] `git push origin master`
- [ ] `bash scripts/agent-lock.sh release`

---

## 📋 Checklist de Release PWA

Antes de desplegar a producción:

- [ ] Todos los tests PWA pasan
- [ ] Build exitoso
- [ ] Iconos actualizados (`npm run pwa:icons`)
- [ ] `manifest.json` tiene nombre, short_name, iconos, colores
- [ ] `sw.js` tiene versionado de cache
- [ ] `firebase.json` tiene headers correctos
- [ ] Auditoría Lighthouse PWA > 90 (opcional, requiere deploy)

---

> **Última actualización:** 2026-07-30