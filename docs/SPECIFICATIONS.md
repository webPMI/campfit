# 📝 Technical Specifications (Core Contracts)

This document serves as the high-level technical contract for the project. It points to the source of truth for various technical aspects to ensure consistency across agents.

## 🏗️ System Architecture
- **Frontend Framework**: [Astro 7](https://astro.build/) (SSG Mode).
- **State Management**: [Nanostores](https://github.com/nanostores/nanostores).
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/).
- **Mobile**: [Capacitor 6](https://capacitorjs.com/).

## 🗄️ Data Architecture (Firestore)
- **Schema Definition**: See [docs/architecture/FIRESTORE_SCHEMA.md](docs/architecture/FIRESTORE_SCHEMA.md) for the complete collection map and field definitions.
- **Security Rules**: See [firestore.rules](firestore.rules) for the actual production security logic.
- **Query Matrix**: See [docs/MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md](docs/MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md) for mapping of queries to specific security rules and indices.

## 🌐 API & Integration Contracts
- **Firebase Auth**: Google Sign-In & Email/Password.
- **Cloudflare R2**: Primary storage for user progress photos and generated media.
- **I18n Strategy**: Client-side translation with `data-i18n` attributes. See [docs/DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md) for localization files.

## 🎨 Design System
- **Theme System**: Custom theme flavors (Dark/Light/Custom) defined in `public/theme-tokens.css` and `src/styles/theme.css`.
- **UI Components**: Atomic components in `src/components/`.

## 🛡️ Critical Constraints (Anti-Regression)
- **Strict Unions**: Do not change strict types (e.g., `type: 'normal' | 'advanced'`) to strings.
- **Query Protection**: Never remove `where`, `orderBy`, or `limit` clauses without audit approval.
- **Timestamping**: All records must use `serverTimestamp()` for `createdAt` and `updatedAt`.
