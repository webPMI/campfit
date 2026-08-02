# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto usa [Semantic Versioning](https://semver.org/lang/es/).

## [Sin versión] - 2026-02-02

### Corregido
- **admin/users.astro**: Restaurado archivo completo (820 líneas) desde git después de corrupción/minificación accidental durante auditoría. Se recuperaron: modal de edición de usuario, asignación de trainer, bloquear/desbloquear, ver perfil médico, reset contraseña, eliminar usuario, filtro por rol y búsqueda.
- **adminSubscriptions.ts**: Restaurado `orderBy('name', 'asc')` en `subscribeToTrainers` que fue eliminado durante auditoría. Este orderBy es crítico para el dropdown de asignación de trainers.
- **adminRender.ts**: Refactorizado `renderUserCardExtended` para eliminar string replace frágil sobre `renderUserRow`. Ahora `renderUserRow` acepta parámetro `extraActions?: string` y `renderUserCardExtended` construye el botón de editar y lo pasa como parámetro.
- **client/dashboard.astro**: Restaurado a versión funcional anterior (`1283d58`) porque la versión actual tenía TypeScript en script inline y otros cambios no deseados. Se corrigieron también non-null assertions y type annotations en el script.
- **i18n/locales/{es,en}.ts**: Eliminadas traducciones duplicadas que causaban error de compilación TypeScript `An object literal cannot have multiple properties with the same name`. Se eliminaron 18 claves duplicadas en `es.ts` y 1 en `en.ts`. Las traducciones funcionales se preservaron.

### Agregado
- **.clinerules**: Agregadas 8 anti-regression rules (#11-#18) para prevenir destrucción de funcionalidades en futuras auditorías:
  - Nunca eliminar cláusulas `orderBy`, `where`, `limit` de queries Firestore
  - Nunca usar `replace_in_file` con SEARCH blocks genéricos
  - Nunca reescribir `.astro` sin before/after snapshot
  - Nunca delegar renderizado HTML a string replace
  - Siempre verificar `git diff` después de modificar services/libs
  - Siempre ejecutar `npm run type-check` y `npm test` después de cada cambio
  - Nunca confiar en caché del IDE
  - Documentar cada cambio en CHANGELOG.md

### Agregado
- **Comentarios de protección en código crítico**:
  - `adminSubscriptions.ts`: Comentarios `@protection` en `subscribeToTrainers` explicando por qué `orderBy('name', 'asc')` y el fallback son críticos.
  - `adminUsers.ts`: Comentario `@protection` en `updateUserProfile` explicando que es la única función de edición de usuarios.
  - `adminRender.ts`: Comentario `@protection` en `renderUserCardExtended` explicando que `showEdit` es usado por `admin/users.astro`.

### Agregado
- **Traducciones i18n faltantes** (no existían previamente en el código):
  - `es.ts` y `en.ts`: 23 claves nuevas de admin, client dashboard, trainer, diet editor y common
  - Ejemplos: `admin.mode.preview`, `client.activePlan`, `diet.editor.meal.allergens`, `trainer.templates`, `admin.no.diets`, `client.diet.noHistory`

### Verificado
- Tests unitarios admin: 53/53 passed
- Type-check: 0 errores en archivos i18n después de corrección
- Git diff confirmado: solo adiciones de traducciones, sin eliminaciones de funcionalidad
