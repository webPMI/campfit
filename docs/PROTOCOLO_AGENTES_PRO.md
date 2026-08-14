# 🤖 Protocolo Profesional Optimizado para Agentes IA - CampFit

> **Versión:** 2.0  
> **Fecha:** 2026-08-10  
> **Objetivo:** Establecer un protocolo estricto, auditado y profesional para evitar errores y eliminaciones no autorizadas

---

## 📋 ÍNDICE OBLIGATORIO DE LECTURA

### 1. ANTES DE EMPEZAR (MANDATORIO)

```
1. docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md  ← PRIMERO
2. .clinerules                                   ← SEGUNDO
3. docs/PROTOCOLO_AGENTES_PRO.md                ← ESTE DOCUMENTO
4. AGENTS.md                                     ← CUARTO
5. CONTEXT.md                                    ← QUINTO
```

**❌ NO EMPIEZAR NINGÚN CAMBIO SIN LEER ESTOS 5 DOCUMENTOS**

---

## 🚨 CHECKLIST PRE-TAREA (EJECUTAR ANTES DE CUALQUIER CAMBIO)

### Paso 1: Verificar Bloqueo de Agentes
```bash
bash scripts/agent-lock.sh check
```
- Si hay otro agente trabajando, ESPERAR o pedir confirmación
- Si no hay script, verificar manualmente que no haya `git status` con cambios pendientes

### Paso 2: Sincronizar con Master
```bash
git pull origin master --allow-unrelated-histories --no-edit
```
- Si hay conflictos, RESOLVERLOS antes de continuar
- **❌ NO forzar merge sin revisar**

### Paso 3: Verificar Estado del Proyecto
```bash
npm run type-check  # Debe pasar sin errores
npm test             # Debe pasar sin errores
```
- Si hay errores preexistentes, REPORTAR y no continuar hasta que se resuelvan

### Paso 4: Entender la Tarea
- Leer TASK.md o el prompt del usuario
- Identificar archivos que se van a modificar
- Verificar que los archivos existen y son correctos
- **❌ NO asumir rutas o nombres de archivos**

---

## 🔒 PROTOCOLO DE MODIFICACIÓN DE ARCHIVOS

### Regla #1: LEER ANTES DE EDITAR
```typescript
// ❌ MAL: Editar directamente sin leer
edit(file_path, old_string, new_string)

// ✅ BIEN: Leer primero, luego editar
read(file_path)
edit(file_path, old_string, new_string)
```

### Regla #2: NO ELIMINAR SIN CONFIRMACIÓN
Antes de eliminar cualquier código:
1. Verificar que no está en `docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md`
2. Buscar referencias en todo el proyecto (grep/glob)
3. Verificar si hay tests que dependen de ese código
4. **SIEMPRE PREGUNTAR ANTES DE ELIMINAR**

### Regla #3: COMENTARIOS INFORMATIVOS OBLIGATORIOS

Cualquier código crítico debe tener un comentario breve:

```typescript
// 🔒 CRÍTICO: Verifica ownership del trainer. Sin esto, cualquier trainer podría modificar dietas de otros.
allow create: if isTrainer() && request.resource.data.trainerId == request.auth.uid;

// 🔒 CRÍTICO: limit(1) obtiene solo la dieta más reciente. Si se elimina, descarga TODAS las dietas históricas.
const q = query(collection(db, 'diets'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(1));

// 🔒 CRÍTICO: Normaliza a UTC para evitar race conditions con zonas horarias.
const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

// 🔒 CRÍTICO: Union estricta de tipos. NUNCA cambiar a string para mantener type-safety.
type: 'normal' | 'definition' | 'volume' | 'keto' | 'vegan' | 'custom';
```

### Regla #4: NO MODIFICAR QUERIES FIRESTORE SIN ENTENDER

```typescript
// ❌ MAL: Eliminar orderBy sin entender por qué existe
const q = query(collection(db, 'diets'), where('clientId', '==', clientId));

// ✅ BIEN: Mantener todas las cláusulas o preguntar
const q = query(collection(db, 'diets'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(1));
```

---

## 🛡️ CHECKLIST DURANTE LA TAREA

### Para Cada Archivo Modificado:

1. **Verificar contexto antes de editar**
   - Leer las primeras 10 líneas del archivo
   - Verificar que el archivo no está minificado
   - Verificar que es el archivo correcto (no una versión vieja)

2. **Verificar cambios después de editar**
   ```bash
   git diff -- path/to/file
   ```
   - Revisar que no se eliminaron líneas no planeadas
   - Revisar que no se eliminaron imports
   - Revisar que no se eliminaron cláusulas de query

3. **Verificar tipo de cambio**
   - ❌ NO cambiar comillas simples a dobles (no es mejora)
   - ❌ NO reformatear HTML como "mejora"
   - ❌ NO minificar código
   - ✅ SOLO cambiar lógica de negocio
   - ✅ SOLO añadir funcionalidad
   - ✅ SOLO corregir bugs

---

## ✅ CHECKLIST POST-TAREA (EJECUTAR DESPUÉS DE CADA CAMBIO)

### Paso 1: Verificar Cambios
```bash
git diff -- src/lib/          # Verificar services/libs
git diff -- firestore.rules    # Verificar reglas de seguridad
git diff -- src/i18n/          # Verificar traducciones
```

**❌ NO COMMIT SI:**
- Se eliminaron cláusulas `where`, `orderBy`, `limit`
- Se eliminaron validaciones de seguridad
- Se eliminaron imports necesarios
- Se eliminaron funciones completas
- Se cambiaron tipos estrictos a `string` o `any`

### Paso 2: Ejecutar Tests
```bash
npm run type-check
npm test
```

**❌ NO COMMIT SI:**
- Hay nuevos errores de TypeScript
- Hay tests que fallan
- Hay warnings de deprecated functions

### Paso 3: Documentar Cambios
Actualizar `CHANGELOG.md` con:
- Fecha
- Archivos modificados
- Tipo de cambio (fix/feature/refactor)
- Justificación breve

### Paso 4: Validar Build
```bash
npm run build
```

**❌ NO COMMIT SI:**
- El build falla
- Hay errores de bundling

---

## 🚨 PROTOCOLO DE EMERGENCIA

### Si Eliminaste Algo por Error:

1. **DETENERSE INMEDIATAMENTE**
   - No hacer más cambios
   - No intentar "arreglar" el error

2. **REVERTIR EL CAMBIO**
   ```bash
   git checkout -- path/to/file
   # O
   git reset --hard HEAD
   ```

3. **REPORTAR AL USUARIO**
   - Explicar qué se eliminó
   - Explicar por qué fue un error
   - Pedir instrucciones

### Si No Estás Seguro:

1. **PREGUNTAR ANTES DE ACTUAR**
   - "No estoy seguro si puedo eliminar X. ¿Puedo continuar?"
   - "El código Y parece duplicado. ¿Debo eliminarlo?"

2. **CREAR UNA RAMA DE PRUEBA**
   ```bash
   git checkout -b test/nombre-del-cambio
   # Hacer cambios
   # Verificar
   # Si está bien, merge a master
   # Si está mal, borrar la rama
   ```

---

## 📊 MATRIZ DE DECISIÓN

| Situación | Acción |
|-----------|--------|
| Código parece duplicado | ❌ NO eliminar. Preguntar primero. |
| Función no se usa | ❌ NO eliminar. Puede ser usada dinámicamente. |
| Import parece innecesario | ❌ NO eliminar. Verificar referencias con grep. |
| Query tiene muchas cláusulas | ❌ NO simplificar. Cada una tiene un propósito. |
| Tipo es `string` pero parece union | ❌ NO cambiar a string. Mantener la union. |
| Comentario es viejo | ❌ NO eliminar. Actualizarlo. |
| Variable no se usa en el scope | ❌ NO eliminar. Puede ser usada en closures. |
| Código está "formateado mal" | ❌ NO reformatear. No es una mejora. |
| Función es larga (>300 líneas) | ✅ Refactorizar en funciones más pequeñas. |
| Hay un bug conocido | ✅ Corregirlo con test primero. |
| Falta una traducción | ✅ Añadir la clave en ES/EN/CA. |
| Falta un test | ✅ Añadir el test. |

---

## 🎯 PROTOCOLO DE COMENTARIOS INFORMATIVOS

### Cuándo Añadir Comentarios:

1. **Funciones críticas de seguridad**
   ```typescript
   // 🔒 CRÍTICO: Verifica que el usuario no esté bloqueado antes de permitir acceso.
   if (isBlocked(userId)) return false;
   ```

2. **Queries de Firestore complejas**
   ```typescript
   // 🔒 CRÍTICO: orderBy('createdAt', 'desc') + limit(1) obtiene solo la dieta más reciente.
   // Sin esto, el cliente descarga TODO el historial en cada carga.
   const q = query(collection(db, 'diets'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(1));
   ```

3. **Tipos estrictos**
   ```typescript
   // 🔒 CRÍTICO: Union estricta. NUNCA cambiar a string para mantener type-safety.
   type DietType = 'normal' | 'definition' | 'volume' | 'keto' | 'vegan' | 'custom';
   ```

4. **Validaciones de ownership**
   ```typescript
   // 🔒 CRÍTICO: Verifica que el trainer solo pueda modificar sus propias dietas.
   // Sin esto, cualquier trainer podría modificar dietas de otros trainers.
   if (diet.trainerId !== trainerId) throw new Error('Unauthorized');
   ```

5. **Campos opcionales críticos**
   ```typescript
   // 🔒 CRÍTICO: Campo allergens es opcional pero usado por intoleranceChecker.
   // NUNCA eliminar, aunque parezca no usarse en este archivo.
   allergens?: string[];
   ```

### Estándar de Comentarios:

- **Breve:** 1-2 líneas máximo
- **Informativo:** Explica QUÉ hace y POR QUÉ es importante
- **Clave:** Usa `// 🔒 CRÍTICO:` para código sensible
- **No redundante:** No comentar código obvio

---

## 🔄 PROTOCOLO DE COORDINACIÓN ENTRE AGENTES

### Antes de Empezar una Tarea:

1. **Verificar que no hay otro agente trabajando**
   ```bash
   bash scripts/agent-lock.sh check
   ```

2. **Si hay otro agente:**
   - Esperar a que termine
   - O pedir permiso para trabajar en paralelo en archivos diferentes

### Durante la Tarea:

1. **Actualizar el lock si la tarea es larga**
   ```bash
   bash scripts/agent-lock.sh update "Trabajando en X"
   ```

2. **Commit intermedios si la tarea es muy larga**
   - No dejar cambios sin commit por más de 30 minutos
   - Usar commits descriptivos

### Después de la Tarea:

1. **Liberar el lock**
   ```bash
   bash scripts/agent-lock.sh release
   ```

2. **Notificar al siguiente agente**
   - "Terminé la tarea X. Los archivos modificados fueron: Y, Z"

---

## 📝 PROTOCOLO DE DOCUMENTACIÓN

### Para Cada Cambio Importante:

1. **Actualizar CHANGELOG.md**
   ```markdown
   ## [2.x.x] - 2026-08-10
   
   ### Fixed
   - Fixed bug in dietService where meal validation was missing allergens check
   
   ### Changed
   - Improved type safety in trainer types (strict unions instead of string)
   
   ### Added
   - Added comments to critical functions for future agent reference
   ```

2. **Si se añade una nueva funcionalidad crítica:**
   - Actualizar `docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md`
   - Añadir la funcionalidad a la lista de protegidas

3. **Si se modifica una funcionalidad crítica:**
   - Actualizar la descripción en `docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md`
   - Justificar el cambio en CHANGELOG.md

---

## 📅 REGISTRO DE AUDITORÍAS (⬅️ NUEVO - OBLIGATORIO)

### Formato de Registro de Auditoría:

Cada auditoría debe registrar en `docs/AUDITORIA_2026-08-10.md` (o el archivo de la fecha):

```markdown
## 🔍 Auditoría - YYYY-MM-DD

> **Fecha:** YYYY-MM-DD (Día)
> **Hora inicio:** HH:MM (Europe/Madrid, UTC+2)
> **Hora fin:** HH:MM (Europe/Madrid, UTC+2)
> **Auditor:** [Nombre del agente]
> **Estado:** ✅ Completada / ⚠️ En progreso

### Resumen
| Métrica | Valor |
|---------|-------|
| Type-check | ❌ N errores |
| Tests | ✅ N passed / ❌ N failed |
| Archivos modificados | N |
```

### Checklist de Auditoría (obligatorio):

1. **Pre-auditoría:**
   - [ ] Verificar `git status` — documentar cambios pendientes
   - [ ] Registrar fecha y hora de inicio
   - [ ] Ejecutar `npm run type-check` — anotar errores
   - [ ] Ejecutar `npm test` — anotar fallos

2. **Durante la auditoría:**
   - [ ] Verificar trabajo de agentes activos (git diff)
   - [ ] Verificar que no se eliminaron funcionalidades críticas
   - [ ] Verificar que las queries Firestore mantienen cláusulas
   - [ ] Verificar que los comentarios 🔒 CRÍTICO están presentes

3. **Post-auditoría:**
   - [ ] Registrar fecha y hora de fin
   - [ ] Actualizar `CHANGELOG.md` con hallazgos
   - [ ] Actualizar `agents/__master.md` con referencias
   - [ ] Notificar al planificador con hallazgos pendientes

### Registro de Auditorías Realizadas:

| Fecha | Hora | Auditor | Alcance | Resultado |
|-------|------|---------|---------|-----------|
| 2026-08-04 | - | Equipo CampFit | Consolidación de 4 auditorías | ✅ 8 corregidos, 269 vigentes |
| 2026-08-05 | - | Equipo CampFit | Documentación | ✅ DOC-001/002/003 corregidos |
| 2026-08-10 | 11:36-12:08 | Cline | Auditoría técnica + checklists mejorados | ⚠️ 13 errores type-check pendientes (de 29) |

---

## 🚦 SEMÁFORO DE DECISIÓN

### 🟢 PUEDES ACTUAR DIRECTAMENTE SI:
- Es un bug obvio con test que falla
- Es una refactorización simple (extraer función)
- Es añadir una traducción faltante
- Es añadir un test faltante
- Has leído los 5 documentos obligatorios
- Has ejecutado el checklist pre-tarea

### 🟡 DEBES PREGUNTAR SI:
- No estás seguro de qué hace el código
- El código parece duplicado pero funciona
- La función parece no usarse
- La query tiene cláusulas que no entiendes
- El tipo es `string` pero parece que debería ser union
- Vas a eliminar más de 5 líneas de código
- Vas a eliminar una función completa

### 🔴 NUNCA ACTÚES SIN PERMISO SI:
- Vas a eliminar una funcionalidad completa
- Vas a eliminar una validación de seguridad
- Vas a simplificar una query de Firestore
- Vas a cambiar un tipo estricto a `string` o `any`
- Vas a eliminar un import
- Vas a eliminar un campo de un tipo
- No has leído los 5 documentos obligatorios
- No has ejecutado el checklist pre-tarea

---

## 🎓 RESUMEN EJECUTIVO

### ✅ SIEMPRE:
1. Leer los 5 documentos obligatorios antes de empezar
2. Ejecutar el checklist pre-tarea
3. Leer archivos antes de editar
4. Añadir comentarios `// 🔒 CRÍTICO:` en código sensible
5. Verificar cambios con `git diff`
6. Ejecutar `npm run type-check` y `npm test`
7. Documentar cambios en CHANGELOG.md

### ❌ NUNCA:
1. Eliminar código sin preguntar primero
2. Eliminar cláusulas de queries Firestore
3. Eliminar validaciones de seguridad
4. Cambiar tipos estrictos a `string` o `any`
5. Reformatear código como "mejora"
6. Commit sin verificar cambios
7. Commit si tests fallan

### 🤔 PREGUNTAR SI:
1. No estás seguro de qué hace el código
2. El código parece duplicado
3. Vas a eliminar más de 5 líneas
4. Vas a eliminar una función completa
5. No entiendes por qué existe algo

---

> **🚨 ESTE PROTOCOLO ES OBLIGATORIO PARA TODOS LOS AGENTES**  
> **❌ VIOLAR ESTE PROTOCOLO PUEDE RESULTAR EN ELIMINACIÓN DE FUNCIONALIDADES CRÍTICAS**  
> **✅ SEGUIR ESTE PROTOCOLO GARANTIZA TRABAJO PROFESIONAL Y SIN ERRORES**
