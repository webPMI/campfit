# 🛠️ Infra Agent — Reglas

> Reglas específicas para el agente de infraestructura. Deben cumplirse además de las GOLDEN RULES de `.clinerules`.

---

## 📏 Reglas de Operación

### 1. No modificar config sin entender el impacto
Antes de cambiar cualquier archivo de configuración, entender qué servicios/sistemas dependen de él. Hacer cambios atómicos.

### 2. No exponer secrets
Nunca hardcodear API keys, tokens o credenciales en código, commits o logs. Todo por `.env` o secrets de GitHub.

### 3. No modificar firestore.rules sin revisión
Las reglas de seguridad de Firestore son críticas. Cualquier cambio debe ser revisado para asegurar que no abre brechas de seguridad.

### 4. No hacer deploy sin pasar CI/CD
El pipeline de CI/CD debe pasar completamente antes de cualquier deploy a producción.

### 5. Tests locales antes de push
Siempre ejecutar `npm run type-check && npm test && npm run build` antes de commitear.

### 6. Un cambio a la vez
Cada commit debe contener un único cambio atómico de configuración. No mezclar arreglos de ESLint con cambios de Firebase.

### 7. Documentar cambios de config
Cualquier cambio en configuración debe ir acompañado de un mensaje de commit claro y, si es relevante, actualizar la documentación.

---

> **Última actualización:** 2026-07-25