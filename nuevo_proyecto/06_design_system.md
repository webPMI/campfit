# 🎨 Design System - CampFit 2.0

## Principios de Diseño

1. **Mobile-First**: Todos los componentes se diseñan primero para móvil
2. **Modo Oscuro por Defecto**: La UI principal es dark theme
3. **Consistencia**: Sistema de tokens (colores, tipografía, espaciado)
4. **Accesibilidad**: WCAG 2.1 AA (contrastes, tamaños, roles ARIA)
5. **Animaciones Suaves**: Micro-interacciones para feedback

---

## Tokens de Diseño

### Colores (Modo Oscuro)

```css
/* Tokens CSS - Sintaxis Tailwind CSS 4 (@theme) */
/* Estos tokens se definen en src/styles/global.css */
@theme {
  --color-primary: #00E676;        /* Verde neón - acción principal */
  --color-primary-hover: #00C853;
  --color-primary-dim: #1B5E20;
  
  --color-secondary: #2979FF;      /* Azul - links, información */
  --color-secondary-hover: #2962FF;
  
  --color-bg-primary: #0A0A0A;     /* Fondo principal */
  --color-bg-secondary: #1A1A1A;   /* Tarjetas, paneles */
  --color-bg-tertiary: #2A2A2A;    /* Hover, elementos elevados */
  
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #B0B0B0;
  --color-text-disabled: #666666;
  
  --color-border: #333333;
  --color-border-light: #444444;
  
  --color-success: #00E676;
  --color-warning: #FFD600;
  --color-danger: #FF1744;
  --color-info: #2979FF;
  
  --color-alert-bg: #4A0000;       /* Fondo de alerta (llamado atención) */
  --color-alert-border: #FF1744;
  
  --color-green: #00E676;          /* > 90% adherencia */
  --color-yellow: #FFD600;         /* 70-90% adherencia */
  --color-red: #FF1744;            /* < 70% adherencia */
}
```

### Tipografía

```css
:root {
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Tamaños */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  
  /* Pesos */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Espaciado

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
}
```

### Bordes y Sombras

```css
:root {
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 10px rgba(0,230,118,0.3);  /* Glow verde neón */
}
```

---

## Catálogo de Componentes

### Átomos

#### Button
```tsx
// Variantes: primary, secondary, outline, ghost, danger
// Tamaños: sm, md, lg
// Estados: default, hover, active, disabled, loading
<Button variant="primary" size="md" loading>
  ¡A Entrenar!
</Button>
```

#### Input
```tsx
// Tipos: text, email, password, number, search
// Estados: default, focused, error, disabled
<Input 
  type="email" 
  label="Email" 
  placeholder="tu@email.com"
  error="Email inválido"
  icon={MailIcon}
/>
```

#### Select
```tsx
// Variantes: default, searchable (con búsqueda)
<Select
  label="Dificultad"
  options={[
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Intermedio' },
    { value: 'hard', label: 'Avanzado' },
  ]}
/>
```

#### Slider
```tsx
// Rango: 1-10 (RPE), 0-300 (peso)
<Slider
  min={1}
  max={10}
  value={rpe}
  onChange={setRpe}
  label="Esfuerzo Percibido (RPE)"
  showValue
/>
```

#### Switch
```tsx
<Switch
  checked={isAlert}
  onChange={setIsAlert}
  label="Llamado de Atención"
/>
```

#### Spinner
```tsx
// Tamaños: sm, md, lg
<Spinner size="md" />
```

#### Badge
```tsx
// Variantes: success, warning, danger, info, default
<Badge variant="success">Ectomorfo</Badge>
<Badge variant="warning">Alerta</Badge>
```

---

### Moléculas

#### StatCard
```tsx
<StatCard
  icon={WeightIcon}
  label="Peso Actual"
  value="75 kg"
  trend="down"        // up | down | stable
  trendValue="-2 kg"  // vs última medición
/>
```

#### ProgressBar
```tsx
<ProgressBar
  value={75}           // 0-100
  max={100}
  label="Rutina Semanal"
  showPercentage
  variant="primary"    // primary | success | warning | danger
/>
```

#### AlertBanner
```tsx
// Variantes: info, success, warning, danger
<AlertBanner
  variant="danger"
  message="¡Atención! Tienes un llamado de atención pendiente"
  onDismiss={handleDismiss}
  persistent          // No se puede cerrar hasta resolver
/>
```

#### Accordion
```tsx
<Accordion title="Sentadilla Búlgara - 4x10">
  <p>Mantén la espalda recta y baja hasta que el muslo quede paralelo al suelo.</p>
  <p>Descanso: 90 segundos</p>
</Accordion>
```

#### EmptyState
```tsx
<EmptyState
  icon={WorkoutIcon}
  title="Sin rutina asignada"
  description="Seba está preparando tu plan personalizado. Recibirás una notificación cuando esté listo."
  actionLabel="Contactar a Seba"
  onAction={goToChat}
/>
```

---

### Organismos

#### TabBar
```tsx
// Uso: días de la semana, comidas del día
<TabBar
  tabs={[
    { id: 'monday', label: 'Lun' },
    { id: 'tuesday', label: 'Mar' },
    { id: 'wednesday', label: 'Mié' },
    { id: 'thursday', label: 'Jue' },
    { id: 'friday', label: 'Vie' },
  ]}
  activeTab={activeDay}
  onChange={setActiveDay}
/>
```

#### Modal
```tsx
<Modal
  open={isOpen}
  onClose={handleClose}
  title="Registrar RPE"
  size="sm"           // sm | md | lg | full
>
  <p>¿Cómo calificas el esfuerzo de esta rutina?</p>
  <Slider min={1} max={10} value={rpe} onChange={setRpe} />
  <Button onClick={handleSave}>Guardar</Button>
</Modal>
```

#### VideoPlayer
```tsx
<VideoPlayer
  src="https://r2.cloudflare.com/videos/ejercicio-123.mp4"
  poster="/thumbnails/ejercicio-123.jpg"
  controls
  autoPlay={false}
/>
```

#### FileUploader
```tsx
<FileUploader
  accept="image/*,video/*"
  maxSize={100 * 1024 * 1024}  // 100MB
  onUpload={handleUpload}
  onProgress={handleProgress}
  label="Subir video del ejercicio"
/>
```

#### ChatBubble
```tsx
<ChatBubble
  message="¿Cómo fue tu entrenamiento de hoy?"
  type="received"     // received | sent | alert
  timestamp={new Date()}
  isRead={true}
/>
```

#### DataTable
```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol' },
    { key: 'actions', label: 'Acciones' },
  ]}
  data={users}
  searchable
  paginated
  pageSize={20}
/>
```

#### LineChart
```tsx
<LineChart
  data={weightHistory}
  xKey="date"
  yKey="weight"
  label="Evolución del Peso"
  color="var(--color-primary)"
  height={250}
/>
```

---

## Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px    /* Móvil grande */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop pequeño */
xl: 1280px   /* Desktop */
2xl: 1536px  /* Desktop grande */

/* Estrategia: Mobile-First */
/* Por defecto: diseño móvil */
/* md: layout tablet con sidebar colapsable */
/* lg: layout desktop con sidebar permanente */
```

---

## Iconos

Usar **Lucide React** como librería de iconos principal:

```bash
npm install lucide-react
```

Iconos clave del proyecto:
- `Dumbbell` - Rutinas/ejercicios
- `Apple` - Dietas/nutrición
- `TrendingUp` - Progreso
- `MessageCircle` - Chat
- `Bell` - Alertas/notificaciones
- `User` - Perfil
- `Settings` - Configuración
- `Shield` - Seguridad/Admin
- `Camera` - Fotos de progreso
- `Play` - Video
- `Check` - Completado
- `AlertTriangle` - Llamados de atención
