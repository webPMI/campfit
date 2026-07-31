# Tests E2E - CampFit

## Tests prioritarios
1. Login flow (email/password)
2. Google login flow
3. Dashboard load for client/admin/trainer
4. Navigation between pages
5. Weight registration

## Setup
- Firebase Emulator required for auth tests
- `npx playwright install` to install browsers
- Create `.env.e2e` with test credentials

## Comandos
- `npm run test:e2e` — Run all E2E tests
- `npx playwright test --ui` — UI mode
- `npx playwright test --debug` — Debug mode