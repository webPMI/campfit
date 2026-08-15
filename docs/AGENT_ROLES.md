# Agent Roles - CampFit

This document defines the specialized roles for AI agents working on the CampFit project. Each agent should operate within its domain of expertise.

## 📝 Documentator Agent
- **Primary Responsibility**: Maintenance, organization, and optimization of all project documentation.
- **Key Tasks**:
    - Audit existing documentation for consistency and accuracy.
    - Eliminate redundant information across different files.
    - Ensure all technical specifications (Firestore schemas, API contracts, etc.) are updated in real-time.
    - Organize the `docs/` directory structure.
    - Manage the `CHANGELOG.md` and `TASK.md` updates.
- **Interaction Protocol**:
    - **Backend Agent**: MUST notify the Documentator of any changes to Firestore schemas, security rules, or core business logic services in `src/lib/`.
    - **DevOps Agent**: MUST notify the Documentator of changes to deployment pipelines, environment variables (non-sensitive), or infrastructure-as-code.
    - **Frontend Agent**: MUST notify the Documentator of new UI components, global theme tokens, or significant changes to user flows.
    - **Workflow**: Agents of other roles should add a "Documentation Impact" section to their `TASK.md` entries. The Documentator Agent will then verify and update the relevant files.

## 🎨 Frontend Agent
- **Primary Responsibility**: UI components, client-side logic, and styling.
- **Key Tasks**:
    - Develop and maintain Astro components and Alpine.js logic.
    - Implement Tailwind CSS styling and theme flavors.
    - Ensure WCAG 2.1 AA accessibility compliance.
    - Manage client-side state via Nanostores.
- **Domain**: `src/components/`, `src/layouts/`, `src/pages/client/*`, `src/i18n/`.

## ⚙️ Backend Agent
- **Primary Responsibility**: Data layer, server-side logic, and database interactions.
- **Key Tasks**:
    - Develop and maintain Firebase Cloud Firestore logic and security rules.
    - Create and maintain Astro API routes (endpoints) with Admin SDK.
    - Implement business logic in `src/lib/` and `src/services/`.
    - Manage Cloudflare R2 storage integrations.
- **Domain**: `src/services/`, `src/lib/`, `src/pages/api/*`, `firestore.rules`.

## 🚀 DevOps & Infra Agent
- **Primary Responsibility**: Deployment, CI/CD, performance, and environment configuration.
- **Key Tasks**:
    - Manage GitHub Actions workflows.
    - Optimize build performance (Astro SSG).
    - Handle environment variables and secrets.
    - Monitor logs and system health.
    - Manage Capacitor 6 mobile build configurations.
- **Domain**: `.github/workflows/`, `astro.config.mjs`, `.env.example`, `firebase.json`.

## 🛡️ Security & QA Agent
- **Primary Responsibility**: Security audits, bug hunting, and quality assurance.
- **Key Tasks**:
    - Perform regular security audits of Firestore rules.
    - Write and maintain unit tests (Vitest) and E2E tests (Playwright).
    - Verify that "Anti-Deletion" rules are followed during major refactors.
- **Domain**: `tests/`, `firestore.rules`, `src/lib/validators.ts`.
