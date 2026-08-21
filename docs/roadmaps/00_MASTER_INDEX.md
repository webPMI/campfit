# 📋 Master Audit & Execution Matrix (30 Secciones de CampFit)

Este documento indexa las 30 partes del sistema para la auditoría y ejecución autónoma continua.

---

## 🗺️ Índice de las 30 Secciones

### 🔐 Bloque A: Autenticación, Landing & Onboarding
- [ ] **01** — [`01_auth_login_flow.md`](./01_auth_login_flow.md): Login, recuperación de contraseña, Firebase Auth & Google Sign-in.
- [ ] **02** — [`02_auth_register_flow.md`](./02_auth_register_flow.md): Registro, validaciones, selector de rol, términos legales.
- [ ] **03** — [`03_onboarding_wizard.md`](./03_onboarding_wizard.md): Asistente de onboarding, antropometría y metas iniciales.
- [ ] **04** — [`04_role_routing_gateway.md`](./04_role_routing_gateway.md): Gateway de redirección por roles (`/index`, `/dashboard`, guards).
- [ ] **05** — [`05_error_pages_and_layout.md`](./05_error_pages_and_layout.md): 404, 500, BaseLayout y selector de Theme Flavors.

### 📱 Bloque B: Portal Cliente - Entrenamiento, Salud & Nutrición
- [ ] **06** — [`06_client_dashboard.md`](./06_client_dashboard.md): Dashboard cliente, racha, hidratación, widgets de hoy.
- [ ] **07** — [`07_client_workouts_core.md`](./07_client_workouts_core.md): Ejecución de rutinas en vivo, series, reps, RPE y notas.
- [ ] **08** — [`08_client_starter_autonomy.md`](./08_client_starter_autonomy.md): Modo Autonomía, programas base 3D/4D, biblioteca y preferencias.
- [ ] **09** — [`09_client_diets_and_metabolic.md`](./09_client_diets_and_metabolic.md): Calculadora metabólica TDEE/BMR y explorador de alimentos.
- [ ] **10** — [`10_client_diet_tracking_substitutes.md`](./10_client_diet_tracking_substitutes.md): Tracking de ingestas, sustituciones inteligentes de alimentos.
- [ ] **11** — [`11_client_progress_photos_r2.md`](./11_client_progress_photos_r2.md): Registro de peso y subida de fotos frontal/perfil/espalda a R2.
- [ ] **12** — [`12_client_calendar_and_agenda.md`](./12_client_calendar_and_agenda.md): Calendario de entrenamientos y agenda de actividades.

### 💬 Bloque C: Portal Cliente - Comunicación, Salud & Soporte
- [ ] **13** — [`13_client_medical_profile.md`](./13_client_medical_profile.md): Perfil médico, alergias, intolerancias y lesiones articulares.
- [ ] **14** — [`14_client_chat_messaging.md`](./14_client_chat_messaging.md): Chat interactivo cliente-entrenador con adjuntos y estados.
- [ ] **15** — [`15_client_support_hub_tickets.md`](./15_client_support_hub_tickets.md): Centro de ayuda, reporte de tickets y seguimiento de solicitudes.
- [ ] **16** — [`16_client_settings_and_profile.md`](./16_client_settings_and_profile.md): Configuración de cuenta, avatar en R2 y preferencias.

### 🏋️‍♂️ Bloque D: Portal Entrenador
- [ ] **17** — [`17_trainer_dashboard_overview.md`](./17_trainer_dashboard_overview.md): Dashboard del coach, adherencia de clientes y métricas.
- [ ] **18** — [`18_trainer_clients_management.md`](./18_trainer_clients_management.md): Lista de alumnos, perfiles individuales y progreso.
- [ ] **19** — [`19_trainer_workouts_editor.md`](./19_trainer_workouts_editor.md): Creador y editor de rutinas para alumnos.
- [ ] **20** — [`20_trainer_diets_editor.md`](./20_trainer_diets_editor.md): Creador y asignador de dietas y planes nutricionales.
- [ ] **21** — [`21_trainer_clinical_radar.md`](./21_trainer_clinical_radar.md): Radar de lesiones, intolerancias y solicitudes de exclusión.
- [ ] **22** — [`22_trainer_chat_and_video_feedback.md`](./22_trainer_chat_and_video_feedback.md): Chat con alumnos y corrección de técnica en vídeo R2.
- [ ] **23** — [`23_trainer_settings.md`](./23_trainer_settings.md): Configuración y perfil profesional del entrenador.

### 🛡️ Bloque E: Portal Administrador, Seguridad & Infraestructura
- [ ] **24** — [`24_admin_dashboard_metrics.md`](./24_admin_dashboard_metrics.md): Dashboard de métricas globales de plataforma.
- [ ] **25** — [`25_admin_users_and_roles.md`](./25_admin_users_and_roles.md): Gestión de usuarios, roles, bloqueo y asignación de coach.
- [ ] **26** — [`26_admin_catalogs_exercises_foods.md`](./26_admin_catalogs_exercises_foods.md): Catálogo maestro de ejercicios y base de alimentos.
- [ ] **27** — [`27_admin_tickets_support_management.md`](./27_admin_tickets_support_management.md): Bandeja de soporte, resolución de tickets y feedback.
- [ ] **28** — [`28_admin_devtools_seeds_logs.md`](./28_admin_devtools_seeds_logs.md): DevTools, seeding de base de datos y visor de logs.
- [ ] **29** — [`29_api_endpoints_and_storage_r2.md`](./29_api_endpoints_and_storage_r2.md): Endpoints API, presigned URLs y Worker de Cloudflare R2.
- [ ] **30** — [`30_security_rules_pwa_and_i18n.md`](./30_security_rules_pwa_and_i18n.md): Firestore Security Rules, PWA Service Worker y traducciones i18n.
