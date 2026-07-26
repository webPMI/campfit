# ✅ Infra Agent — Checklist Operativo

> Checklist paso a paso para cada sesión de trabajo del agente de infraestructura.

---

## 🔄 Pre-Sesión

- [ ] Leer `agents/__master.md` para entender el ecosistema
- [ ] Leer `agents/infra-agent/GUIDE.md` si es primera vez
- [ ] Revisar `agents/infra-agent/TASKS.md` para prioridades
- [ ] Revisar problemas conocidos (INFRA-001 a INFRA-006)
- [ ] Ejecutar `npm run doctor`
- [ ] Verificar `bash scripts/agent-lock.sh check`

---

## 💻 Desarrollo

- [ ] Identificar qué archivo de configuración modificar
- [ ] Hacer backup mental del estado actual
- [ ] Implementar cambio atómico (UN solo cambio)
- [ ] Verificar que no rompe nada: `npm run type-check`
- [ ] Ejecutar tests: `npm test`

---

## ✅ Validación

- [ ] `npm run type-check` (sin errores)
- [ ] `npm test` (todos pasan)
- [ ] `npm run build` (build exitoso)
- [ ] Verificar que el cambio no introduce regresiones
- [ ] Commit con mensaje descriptivo del cambio de config

---

## 📤 Post-Sesión

- [ ] `bash scripts/validate.sh --quick`
- [ ] `git add -A && git commit`
- [ ] `git push origin master`
- [ ] `bash scripts/agent-lock.sh release`

---

> **Última actualización:** 2026-07-25