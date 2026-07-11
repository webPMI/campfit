# CampFit 2.0 — Git Workflow & Deploy

> **Propósito:** Documentar el flujo de trabajo con git para que cualquier agente (IA o humano) pueda hacer commits, push y deploy sin necesidad de preguntar.

---

## 📦 Repositorio

- **Remote:** `https://github.com/webPMI/campfit.git`
- **Branch principal:** `master`
- **Git config local del repo:**
  ```bash
  git config user.name "webPMI"
  git config user.email "webPMI@users.noreply.github.com"
  ```

> ⚠️ Si no hay git config, configurar antes del primer commit:
> ```bash
> git config user.name "webPMI"
> git config user.email "webPMI@users.noreply.github.com"
> ```

---

## 🔄 Flujo de Trabajo Estándar

### 1. Hacer cambios → Commit → Push

```bash
# Ver estado actual
git status

# Añadir todo
git add -A

# Commit con mensaje descriptivo (conventional commits)
git commit -m "tipo: descripción breve

- Detalle 1
- Detalle 2"

# Push
git push origin master
```

### 2. Si el remote tiene cambios nuevos (rejected)

```bash
# Hacer pull con merge (unrelated histories si es primera vez)
git pull origin master --allow-unrelated-histories --no-edit

# Si hay conflictos, resolver con nuestra versión:
git checkout --ours .
git add -A
git commit -m "merge: integrar cambios remotos"

# Push
git push origin master
```

### 3. Si es el primer commit del repo local

```bash
# Configurar identidad (solo una vez)
git config user.name "webPMI"
git config user.email "webPMI@users.noreply.github.com"

# Commit inicial
git add -A
git commit -m "tipo: mensaje"

# Push (la primera vez necesita -u)
git push -u origin master
```

---

## 🏷️ Convención de Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

| Tipo | Uso |
|------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Refactorización sin cambios funcionales |
| `docs:` | Documentación |
| `test:` | Tests |
| `chore:` | Tareas de mantenimiento |
| `merge:` | Merge de ramas |

**Ejemplos:**
```
fix: corregir requireAuth por requireAdmin en admin/clients.astro
feat: añadir signOutUser a trainerUtils.ts
refactor: unificar auth guards en shared/authGuard.ts
docs: crear GIT_WORKFLOW.md con flujo de git
```

---

## 🚀 Deploy a Firebase

### Prerrequisitos
- Tener Firebase CLI instalado: `npm install -g firebase-tools`
- Estar autenticado: `firebase login`
- Tener el proyecto configurado en `.firebaserc`

### Comandos

```bash
# Build del proyecto
npm run build

# Deploy a Firebase Hosting + Firestore Rules + Indexes
firebase deploy

# Deploy solo hosting (rápido)
firebase deploy --only hosting

# Deploy solo rules
firebase deploy --only firestore:rules
```

### Scripts en package.json

```bash
npm run build    # Build de Astro
npm run preview  # Preview local del build
```

---

## ⚠️ Troubleshooting Común

### "Author identity unknown"
```bash
git config user.name "webPMI"
git config user.email "webPMI@users.noreply.github.com"
```

### "failed to push some refs" (remote tiene cambios)
```bash
git pull origin master --allow-unrelated-histories --no-edit
# Si hay conflictos:
git checkout --ours .
git add -A
git commit -m "merge: integrar cambios remotos"
git push origin master
```

### Conflictos en merge
Siempre resolver con `--ours` (nuestra versión local) a menos que se sepa que el remote tiene cambios que debemos mantener.

```bash
git checkout --ours .
git add -A
git commit -m "merge: resolver conflictos con versión local"
```

---

## 📁 Archivos Ignorados (.gitignore)

- `node_modules/`
- `.env`
- `dist/`
- `.firebase/` (caché local de hosting)

---

## 🔗 Referencias

- Repo: `https://github.com/webPMI/campfit`
- Issues/PRs: GitHub web
- Firebase Console: https://console.firebase.google.com
