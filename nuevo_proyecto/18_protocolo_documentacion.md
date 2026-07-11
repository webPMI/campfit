# 📋 Protocolo de Documentación - CampFit 2.0

> **Propósito:** Mantener la documentación optimizada, sin redundancias y actualizada en cada paso del desarrollo.

---

## 🥇 Regla de Oro: DRY (Don't Repeat Yourself)

**Cada concepto vive en UN solo lugar.** Si necesitas referenciarlo desde otro documento, usa una referencia cruzada:

```markdown
> 📌 Ver `XX_archivo.md` para más detalles.
```

### Ejemplos de referencias correctas:
- ✅ `> 📌 Reglas de seguridad: Ver 05_reglas_seguridad.md`
- ✅ `> 📌 Variables de entorno: Ver 13_setup_guide.md`
- ✅ `> 📌 Golden Rules: Ver .clinerules`
- ❌ NO copies el stack tecnológico en cada documento
- ❌ NO copies las convenciones de código en múltiples archivos

---

## 🔄 Ciclo de Vida de la Documentación

### 1. Antes de crear un nuevo documento
- [ ] ¿El contenido ya existe en otro documento?
- [ ] ¿Puedo añadirlo a un documento existente en lugar de crear uno nuevo?
- [ ] Si es nuevo, ¿dónde se referencia desde el índice (00_indice.md)?

### 2. Al modificar código
- [ ] ¿Cambia la estructura de datos? → Actualizar `04_modelo_datos_firestore.md`
- [ ] ¿Cambia una API endpoint? → Actualizar `15_api_contracts.md`
- [ ] ¿Cambia una ruta? → Actualizar `07_flujos_navegacion.md`
- [ ] ¿Cambia una regla de seguridad? → Actualizar `05_reglas_seguridad.md`
- [ ] ¿Cambia una dependencia? → Actualizar `13_setup_guide.md`

### 3. Al eliminar una funcionalidad
- [ ] Eliminar o marcar como obsoleto el documento correspondiente
- [ ] Actualizar `00_indice.md` si se elimina un archivo
- [ ] Actualizar referencias cruzadas en otros documentos

### 4. Cada release
- [ ] Revisar que no haya contenido duplicado (usar `search_files` para detectar)
- [ ] Verificar que todas las referencias cruzadas apunten a archivos existentes
- [ ] Actualizar `00_indice.md` si cambió la numeración

---

## 🏗️ Estructura Actual (18 archivos)

| # | Archivo | Responsabilidad | Monolito relacionado |
|---|---------|-----------------|---------------------|
| 00 | `00_indice.md` | Índice general + enlaces rápidos | - |
| 01 | `01_vision_objetivos.md` | Visión, objetivos de negocio, KPIs | - |
| 02 | `02_requisitos_funcionales.md` | Requisitos por módulo y actor | - |
| 03 | `03_arquitectura_tecnica.md` | Stack, estructura, monolitos | - |
| 04 | `04_modelo_datos_firestore.md` | Modelos de datos (7 colecciones) | - |
| 05 | `05_reglas_seguridad.md` | Reglas Firestore por rol | - |
| 06 | `06_design_system.md` | Componentes UI (Atomic Design) | `shared` |
| 07 | `07_flujos_navegacion.md` | Rutas, diagramas de navegación | - |
| 08 | `08_modulo_autenticacion.md` | Auth completo (login, registro, guards) | `auth` |
| 09 | `09_modulo_cliente.md` | Dashboard, rutinas, dietas, progreso, chat | `client` |
| 10 | `10_modulo_administracion.md` | Panel admin, gestión, editores | `admin` |
| 11 | `11_integraciones_operaciones.md` | Firebase, R2, Capacitor, Workers, CI/CD, Sentry, PostHog | `workers/` |
| 12 | `12_guia_desarrollo_testing.md` | Convenciones, Git workflow, tests, comandos, debugging | - |
| 13 | `13_setup_guide.md` | Setup inicial, configs, dependencias | - |
| 14 | `14_agent_instructions.md` | Instrucciones para agentes IA (multi-agente) | - |
| 15 | `15_api_contracts.md` | API endpoints, streams, índices Firestore | - |
| 16 | `16_implementacion_incremental.md` | Estrategia de implementación | - |
| 17 | `17_glosario.md` | Glosario de términos | - |
| 18 | **`18_protocolo_documentacion.md`** | **Este archivo - Protocolo de documentación** | - |

---

## 🔒 Protocolo de Concurrencia para Documentación

### ⚠️ Regla Fundamental
**NUNCA dos agentes modificando el mismo archivo de documentación simultáneamente.**

### Sistema de Lock

La documentación tiene un lock GLOBAL en `docs/nuevo_proyecto/.agent-lock`:

```bash
# 1. VERIFICAR antes de escribir
ls docs/nuevo_proyecto/.agent-lock 2>/dev/null && echo "🔴 LOCKED - Esperar" || echo "🟢 FREE - Puedes continuar"

# 2. Si está FREE, crear el lock
echo "agent-{id}:$(date +%s):{feature-name}" > docs/nuevo_proyecto/.agent-lock

# 3. Trabajar en la documentación (solo lectura no requiere lock)

# 4. Al terminar, liberar el lock
rm docs/nuevo_proyecto/.agent-lock
```

### Mapa de Propietarios de Documentación

| Archivo | Propietario (agente que MODIFICA) |
|---------|----------------------------------|
| `00_indice.md` | Cualquier agente (solo al añadir/eliminar docs) |
| `01_vision_objetivos.md` | Solo humano |
| `02_requisitos_funcionales.md` | Solo humano |
| `03_arquitectura_tecnica.md` | Solo humano |
| `04_modelo_datos_firestore.md` | Agente que cambie estructura de datos |
| `05_reglas_seguridad.md` | Agente E (infra) |
| `06_design_system.md` | Agente A (shared) |
| `07_flujos_navegacion.md` | Agente que añada/modifique rutas |
| `08_modulo_autenticacion.md` | Agente B (auth) |
| `09_modulo_cliente.md` | Agente C (client) |
| `10_modulo_administracion.md` | Agente D (admin) |
| `11_integraciones_operaciones.md` | Agente E (infra) |
| `12_guia_desarrollo_testing.md` | Solo humano |
| `13_setup_guide.md` | Agente que cambie dependencias |
| `14_agent_instructions.md` | Solo humano |
| `15_api_contracts.md` | Agente que cree/modifique APIs |
| `16_implementacion_incremental.md` | Solo humano |
| `17_glosario.md` | Cualquier agente (solo añadir términos) |
| `18_protocolo_documentacion.md` | Solo humano |

**Regla:** Si el propietario es "Solo humano", los agentes IA solo leen, nunca modifican.

### Stale Locks (Recuperación)
- Si un lock tiene más de 30 minutos, se considera abandonado
- Cualquier agente puede eliminar un lock stale
- Verificar timestamp: `cat docs/nuevo_proyecto/.agent-lock | cut -d':' -f2`

---

## 🔍 Detección de Redundancias

Cada vez que un agente IA trabaje en el proyecto, debe ejecutar este check rápido:

```bash
# Buscar stack tecnológico duplicado
grep -r "Astro 5\|React 19\|Tailwind CSS 4" docs/ --include="*.md" -l

# Buscar variables de entorno duplicadas
grep -r "PUBLIC_FIREBASE" docs/ --include="*.md" -l

# Buscar golden rules duplicadas
grep -r "NUNCA\|SIEMPRE\|Golden Rules" docs/ --include="*.md" -l
```

Si algún concepto aparece en más de un archivo (además del archivo fuente), hay que reemplazarlo por una referencia cruzada.


---

## 📝 Template para Nuevos Documentos

```markdown
# � Título del Documento

> **Propósito:** [Una línea describiendo qué cubre este documento]

---

## Contenido

[Contenido del documento - SIN repetir información de otros documentos]

---

> **📌 Referencias relacionadas:**
> - Ver `XX_archivo.md` para [tema relacionado]
> - Ver `YY_archivo.md` para [otro tema relacionado]
```

---

## ⚠️ Checklist de Calidad (Pre-commit para documentación)

- [ ] ¿Cada concepto aparece en UN solo lugar?
- [ ] ¿Las referencias cruzadas usan el formato `> 📌 Ver X.md`?
- [ ] ¿El índice `00_indice.md` está actualizado?
- [ ] ¿No hay archivos obsoletos sin marcar?
- [ ] ¿Los nombres de archivo siguen kebab-case y numeración secuencial?
- [ ] ¿No hay contenido copiado de otros documentos?
