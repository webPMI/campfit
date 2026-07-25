# 📋 Client Agent Rules

> **Reglas específicas del módulo Cliente** — CampFit

---

## 1. Separación de responsabilidades

**No incluir lógica de negocio en páginas .astro.** Toda la lógica debe estar encapsulada en servicios dentro de `src/lib/client/`. Las páginas .astro solo deben importar y llamar a estos servicios, delegando toda la lógica de datos y estado a los módulos de servicio.

✅ Correcto:
```astro
---
import { getWorkouts } from "../../lib/client/workoutService";
const { data, error } = await getWorkouts(userId);
---
```

❌ Incorrecto:
```astro
---
import { collection, query, where, getDocs } from "firebase/firestore";
const q = query(collection(db, "workouts"), where("clientId", "==", userId));
const snapshot = await getDocs(q);
---
```

---

## 2. Límites en consultas Firestore

Toda consulta a Firestore debe incluir obligatoriamente `limit()` con un máximo de **100 documentos** por consulta. Esto previene lecturas excesivas y costos innecesarios.

✅ Correcto:
```typescript
const q = query(
  collection(db, "messages"),
  where("chatId", "==", chatId),
  orderBy("timestamp", "desc"),
  limit(100)
);
```

❌ Incorrecto:
```typescript
const q = query(
  collection(db, "messages"),
  where("chatId", "==", chatId),
  orderBy("timestamp", "desc")
  // Sin limit()
);
```

---

## 3. Estados de página obligatorios (4 estados)

Cada página del módulo cliente debe manejar obligatoriamente los siguientes 4 estados:

| Estado | Cuándo ocurre | UI que muestra |
|--------|---------------|----------------|
| `loading` | Mientras se cargan datos iniciales | Spinner / skeleton |
| `empty` | La consulta devuelve 0 resultados | Mensaje "No hay datos" + CTA |
| `error` | La consulta falla (red, permisos, etc.) | Mensaje de error + botón reintentar |
| `success` | Datos cargados exitosamente | Contenido normal |

```typescript
type PageState = "loading" | "empty" | "error" | "success";
```

Implementación mínima en cada página:
- Estado inicial: `loading`
- Transición a `empty` si snapshot vacío
- Transición a `error` si hay excepción
- Transición a `success` si datos OK

---

## 4. JSDoc en funciones públicas

Todas las funciones públicas exportadas desde servicios en `src/lib/client/` deben tener JSDoc completo:

✅ Correcto:
```typescript
/**
 * Obtiene los workouts asignados a un cliente.
 * @param {string} clientId - ID del cliente
 * @returns {Promise<{data?: Workout[], error?: string}>}
 */
export async function getWorkouts(clientId: string) {
```

El JSDoc debe incluir:
- Descripción clara de lo que hace la función
- `@param` para cada parámetro (nombre y descripción)
- `@returns` con tipo y descripción
- `@throws` si aplica
- `@example` para casos complejos (opcional pero recomendado)

---

## 5. Cleanup de suscripciones Firestore

Toda suscripción en tiempo real con `onSnapshot()` debe:
1. Guardar la función `unsubscribe` en un array
2. Proveer un mecanismo de cleanup que se ejecute al desmontar el componente

✅ Correcto:
```typescript
const unsubscribers: (() => void)[] = [];

const unsub1 = onSnapshot(query1, (snapshot) => {
  // handle
});
unsubscribers.push(unsub1);

const unsub2 = onSnapshot(query2, (snapshot) => {
  // handle
});
unsubscribers.push(unsub2);

// Exportar cleanup para que la página lo llame en onDestroy
export function cleanup() {
  unsubscribers.forEach((unsub) => unsub());
  unsubscribers.length = 0;
}
```

---

## 6. Tests unitarios obligatorios

Cada función pública de cada servicio en `src/lib/client/` debe tener tests unitarios que cubran:

- **Escenario éxito:** La función retorna los datos esperados
- **Escenario error:** La función maneja errores correctamente (Firestore falla, permisos, etc.)
- **Edge cases:** Datos vacíos, IDs inválidos, usuarios no autenticados

Los tests deben:
- Usar los mocks de Firebase del proyecto (`tests/mocks/`)
- Seguir el patrón AAA (Arrange, Act, Assert)
- Tener nombres descriptivos: `should return workouts when clientId is valid`
- No hardcodear datos (usar factories si están disponibles)

---

## 7. Nomenclatura y estilo

- **Archivos:** camelCase para servicios (`chatService.ts`), kebab-case para páginas (`medical-profile.astro`)
- **Funciones:** camelCase, verbos descriptivos (`getWorkouts`, `markWorkoutComplete`, `sendMessage`)
- **Variables:** camelCase, nombres descriptivos (`unreadMessages`, `completedWorkouts`)
- **Tipos:** PascalCase, interfaz con prefijo I opcional pero consistente

---

## 8. Manejo de errores

- Siempre retornar objetos con estructura `{ data?, error? }` desde los servicios
- NO lanzar excepciones crudas desde servicios públicos
- NO mostrar errores de Firebase directamente al usuario (traducirlos primero)
- Usar el logger del proyecto (`src/lib/shared/logger.ts`) para errores internos

---

## 9. Internacionalización

- Todo texto visible al usuario debe usar i18n (no texto hardcodeado)
- Usar `src/lib/shared/i18n.ts` o `src/i18n/translations.ts` según corresponda
- Añadir nuevas claves a ambos idiomas (ES y EN) al agregar texto nuevo

---

## 10. Versionado y commits

- Usar conventional commits: `feat(client):`, `fix(client):`, `test(client):`, `refactor(client):`
- Un commit por funcionalidad o fix
- No commitear código roto (siempre pasar `npm run type-check` y `npm test` antes)

---

> **Incumplir estas reglas = revert en code review.**
