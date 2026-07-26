# ✅ Trainer Agent — Checklist Operativo

> Checklist paso a paso para cada sesión de trabajo del agente trainer.

---

## 🔄 Pre-Sesión

- [ ] Leer `agents/__master.md` para entender el ecosistema
- [ ] Leer `agents/trainer-agent/GUIDE.md` si es primera vez
- [ ] Revisar `agents/trainer-agent/TASKS.md` para prioridades
- [ ] Leer `TODO.md` para contexto general
- [ ] Ejecutar `npm run doctor`
- [ ] Verificar `bash scripts/agent-lock.sh check`

---

## 💻 Desarrollo

- [ ] Revisar páginas trainer existentes (`src/pages/trainer/`)
- [ ] Revisar servicios trainer (`src/lib/trainer/`)
- [ ] Implementar cambios siguiendo RULES.md
- [ ] Escribir/actualizar tests unitarios
- [ ] Verificar: `npm test`

---

## ✅ Validación

- [ ] `npm run type-check` (sin errores)
- [ ] `npm test` (todos pasan)
- [ ] `npm run build` (build exitoso)
- [ ] Commit siguiendo conventional commits

---

## 📤 Post-Sesión

- [ ] `bash scripts/validate.sh --quick`
- [ ] `git add -A && git commit`
- [ ] `git push origin master`
- [ ] `bash scripts/agent-lock.sh release`

---

> **Última actualización:** 2026-07-25