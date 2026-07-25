# ✅ Admin Agent — Checklist Operativo

> Checklist paso a paso para cada sesión de trabajo del agente admin.

---

## 🔄 Pre-Sesión

- [ ] Leer `agents/__master.md` para entender el ecosistema de agentes
- [ ] Leer `agents/admin-agent/GUIDE.md` si es primera vez
- [ ] Revisar `agents/admin-agent/TASKS.md` para ver prioridades
- [ ] Leer `TODO.md` para contexto general del proyecto
- [ ] Ejecutar `npm run doctor` para diagnóstico del proyecto
- [ ] Verificar `bash scripts/agent-lock.sh check` (lock libre)

---

## 💻 Desarrollo

- [ ] Revisar páginas admin existentes (`src/pages/admin/`)
- [ ] Revisar servicios admin (`src/lib/admin/`)
- [ ] Verificar si `src/services/adminService.ts` sigue en uso
- [ ] Implementar cambios siguiendo RULES.md
- [ ] Escribir/actualizar tests unitarios (3 escenarios: éxito, error, edge case)
- [ ] Verificar que los tests pasan: `npm test`

---

## ✅ Validación

- [ ] `npm run type-check` (sin errores)
- [ ] `npm test` (todos los tests pasan)
- [ ] Revisar cobertura si aplica: `npm run test:coverage`
- [ ] `npm run build` (build exitoso)
- [ ] Commit siguiendo conventional commits

---

## 📤 Post-Sesión

- [ ] `bash scripts/validate.sh --quick` (validación rápida)
- [ ] `git add -A && git commit -m "feat: descripción"`
- [ ] `git push origin master`
- [ ] `bash scripts/agent-lock.sh release`

---

> **Última actualización:** 2026-07-25