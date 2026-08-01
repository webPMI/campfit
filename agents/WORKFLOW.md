# 🔄 CampFit Optimized Workflow — Sistema Multi-Agente Práctico

## ⚠️ Realidad vs Teoría

| Teoría (actual) | Realidad (Cline/IDE) |
|-----------------|---------------------|
| Múltiples agentes trabajando en paralelo | **Un solo agente** ejecutando secuencialmente |
| Sistema de locks para archivos compartidos | **No hay concurrencia real** |
| Despliegue de agentes como entidades separadas | **Cambio de rol/contexto** en el mismo agente |

## 🎯 Sistema Optimizado: **Pipeline Secuencial de Roles**

En lugar de simular agentes concurrentes, el agente **cambia de rol** en una secuencia lógica, preservando contexto entre cambios.

```
┌─────────────────────────────────────────────────────────────────┐
│                    🎯 ROL 1: ORQUESTADOR                         │
│  Análisis de TASK.md + Estrategia + Descomposición              │
│  Output: Plan de acción con subtareas secuenciadas              │
└─────────────────────────────┬───────────────────────────────────┘
                              │ contexto preservado
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🎨 ROL 2: FRONTEND                            │
│  UI/UX, componentes, layouts, responsive, accesibilidad          │
│  Output: HTML/CSS/Tailwind listo                                │
│  Valida: Sin colores hardcodeados, ARIA labels, responsive      │
└─────────────────────────────┬───────────────────────────────────┘
                              │ contexto preservado
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🔧 ROL 3: DATA / AUTH                         │
│  Lógica de negocio, Firebase, servicios, stores                 │
│  Output: Servicios conectados a la UI                           │
│  Valida: Tipos correctos, sin any, logger usado                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │ contexto preservado
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 ROL 4: i18n                                │
│  Traducciones ES/EN, consistencia de claves                     │
│  Output: Claves en translations.ts + client.ts                  │
│  Valida: 0 textos hardcodeados en UI                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │ contexto preservado
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    📊 ROL 5: QA                                  │
│  Tests, type-check, build, validación final                     │
│  Output: 0 errores, todos los tests pasan                       │
│  Valida: npm test + npm run type-check + npm run build          │
└─────────────────────────────┬───────────────────────────────────┘
                              │ contexto preservado
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    📋 ROL 6: DOCS                                │
│  CHANGELOG, MASTER.md, documentación de cambios                  │
│  Output: Documentación actualizada                              │
└─────────────────────────────────────────────────────────────────┘
```

## 📐 Reglas del Pipeline

### 1. Secuencia Estricta
Los roles se ejecutan en orden. No se salta ningún rol a menos que no aplique a la tarea.

### 2. Validación por Rol
Cada rol valida su output antes de pasar al siguiente:
```
Frontend: ¿Responsive? ¿ARIA? ¿Sin colores hardcodeados? ✅ → Pasa a Data
Data: ¿Tipos correctos? ¿Sin any? ¿Logger usado? ✅ → Pasa a i18n
i18n: ¿0 textos hardcodeados? ✅ → Pasa a QA
QA: ¿Tests pasan? ¿Build OK? ✅ → Pasa a Docs
Docs: ¿CHANGELOG actualizado? ✅ → COMPLETADO
```

### 3. Fast-Fail (Fallo Rápido)
Si un rol falla su validación, **NO avanza** al siguiente. Corrige primero.
Esto evita acumular errores que se detectan tarde.

### 4. Contexto Preservado
El agente mantiene en memoria todo lo aprendido en roles anteriores. No pierde contexto al cambiar de rol.

### 5. Sin Locks (innecesarios)
Al ser secuencial, no hay concurrencia. El sistema de locks solo se usa si el usuario despliega agentes externos reales.

## 🚀 Cómo Usar el Pipeline

### Para el USUARIO:
```
"Optimiza el login con toggle de contraseña y validación"
```

### El agente ejecuta automáticamente:

```
ROL 1 (Orquestador): 
  - Lee TASK actual
  - Plan: Frontend (UI del login) → Data (authService logs) → i18n (nuevas claves) → QA → Docs

ROL 2 (Frontend):
  - Añade toggle password en login.astro
  - Añade help text y ARIA
  - Valida: responsive ✅, ARIA ✅, sin hardcode ✅

ROL 3 (Data):
  - Añade logs en authService.loginUser()
  - Valida: tipos ✅, sin any ✅

ROL 4 (i18n):
  - Añade auth.password.show/hide en ES/EN client.ts
  - Valida: 0 hardcodeados ✅

ROL 5 (QA):
  - npm run type-check → OK
  - npm test → OK
  - npm run build → OK

ROL 6 (Docs):
  - Actualiza CHANGELOG.md
  - Hecho ✅
```

## 📊 Comparación: Antes vs Ahora

| Aspecto | Antes (Multi-Agente Teórico) | Ahora (Pipeline Secuencial) |
|---------|------------------------------|----------------------------|
| Concurrencia | Simulada (irreal) | Secuencial (real) |
| Locks | Necesarios | Innecesarios |
| Contexto | Se pierde entre "agentes" | Se preserva entre roles |
| Validación | Al final (tarde) | Por rol (temprano) |
| Corrección | Reasignar agente | Corregir en el mismo rol |
| Complejidad | Alta (13 agentes) | Baja (6 roles) |
| Efectividad | Teórica | Práctica ✅ |

## 🎯 Checklist del Orquestador (ROL 1)

Antes de pasar al ROL 2:

- [ ] Leer TASK.md y entender el objetivo
- [ ] Identificar qué páginas/componentes se modifican
- [ ] Determinar si se necesita: Frontend, Data, i18n, o todos
- [ ] Estimar archivos a modificar
- [ ] Presentar plan al usuario (opcional, si es complejo)