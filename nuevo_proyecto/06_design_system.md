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
  
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  
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

> **Nota:** Todos los componentes se implementan como funciones JS que retornan strings HTML. No se usa React ni JSX.

### Átomos

#### Button
```typescript
// Variantes: primary, secondary, outline, ghost, danger
// Tamaños: sm, md, lg
// Estados: default, hover, active, disabled, loading
function Button({ variant = 'primary', size = 'md', loading = false, children }) {
  return `<button class="btn btn-${variant} btn-${size}" ${loading ? 'disabled' : ''}>
    ${loading ? '<span class="spinner-sm"></span>' : ''}
    ${children}
  </button>`;
}
```

#### Input
```typescript
// Tipos: text, email, password, number, search
// Estados: default, focused, error, disabled
function Input({ type = 'text', label, placeholder, error, icon }) {
  return `
    <div class="input-group">
      ${label ? `<label class="input-label">${label}</label>` : ''}
      <div class="input-wrapper ${error ? 'input-error' : ''}">
        ${icon ? `<span class="input-icon">${icon}</span>` : ''}
        <input type="${type}" placeholder="${placeholder || ''}" class="input-field" />
      </div>
      ${error ? `<span class="input-error-text">${error}</span>` : ''}
    </div>
  `;
}
```

#### Select
```typescript
// Variantes: default, searchable (con búsqueda)
function Select({ label, options = [], value = '' }) {
  return `
    <div class="select-group">
      ${label ? `<label class="select-label">${label}</label>` : ''}
      <select class="select-field">
        ${options.map(opt => `
          <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
            ${opt.label}
          </option>
        `).join('')}
      </select>
    </div>
  `;
}
```

#### Slider
```typescript
// Rango: 1-10 (RPE), 0-300 (peso)
function Slider({ min = 1, max = 10, value = 5, label, showValue = false }) {
  return `
    <div class="slider-group">
      ${label ? `<label class="slider-label">${label}</label>` : ''}
      <input type="range" min="${min}" max="${max}" value="${value}" class="slider" />
      ${showValue ? `<span class="slider-value">${value}</span>` : ''}
    </div>
  `;
}
```

#### Switch
```typescript
function Switch({ checked = false, label, onChange }) {
  return `
    <label class="switch-group">
      <input type="checkbox" class="switch-input" ${checked ? 'checked' : ''} />
      <span class="switch-slider"></span>
      ${label ? `<span class="switch-label">${label}</span>` : ''}
    </label>
  `;
}
```

#### Spinner
```typescript
// Tamaños: sm, md, lg
function Spinner({ size = 'md' }) {
  return `<div class="spinner spinner-${size}"></div>`;
}
```

#### Badge
```typescript
// Variantes: success, warning, danger, info, default
function Badge({ variant = 'default', children }) {
  return `<span class="badge badge-${variant}">${children}</span>`;
}
```

---

### Moléculas

#### StatCard
```typescript
function StatCard({ icon, label, value, trend, trendValue }) {
  return `
    <div class="stat-card">
      <div class="stat-card-icon">${icon}</div>
      <div class="stat-card-body">
        <span class="stat-card-label">${label}</span>
        <span class="stat-card-value">${value}</span>
        ${trend ? `<span class="stat-card-trend trend-${trend}">${trendValue}</span>` : ''}
      </div>
    </div>
  `;
}
```

#### ProgressBar
```typescript
function ProgressBar({ value = 0, max = 100, label, showPercentage = false, variant = 'primary' }) {
  const pct = Math.round((value / max) * 100);
  return `
    <div class="progress-group">
      ${label ? `<span class="progress-label">${label}</span>` : ''}
      <div class="progress-bar">
        <div class="progress-fill progress-${variant}" style="width: ${pct}%"></div>
      </div>
      ${showPercentage ? `<span class="progress-pct">${pct}%</span>` : ''}
    </div>
  `;
}
```

#### AlertBanner
```typescript
// Variantes: info, success, warning, danger
function AlertBanner({ variant = 'info', message, persistent = false }) {
  return `
    <div class="alert-banner alert-${variant} ${persistent ? 'alert-persistent' : ''}">
      <span class="alert-message">${message}</span>
      ${!persistent ? '<button class="alert-dismiss">&times;</button>' : ''}
    </div>
  `;
}
```

#### Accordion
```typescript
function Accordion({ title, children }) {
  return `
    <details class="accordion">
      <summary class="accordion-title">${title}</summary>
      <div class="accordion-content">${children}</div>
    </details>
  `;
}
```

#### EmptyState
```typescript
function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-desc">${description}</p>
      ${actionLabel ? `<button class="btn btn-primary" onclick="${onAction}">${actionLabel}</button>` : ''}
    </div>
  `;
}
```

---

### Organismos

#### TabBar
```typescript
// Uso: días de la semana, comidas del día
function TabBar({ tabs = [], activeTab, onChange }) {
  return `
    <div class="tab-bar">
      ${tabs.map(tab => `
        <button class="tab ${tab.id === activeTab ? 'tab-active' : ''}" 
                data-tab="${tab.id}">
          ${tab.label}
        </button>
      `).join('')}
    </div>
  `;
}
```

#### Modal
```typescript
function Modal({ open = false, title, children, size = 'sm' }) {
  return `
    <div class="modal-overlay ${open ? 'modal-open' : ''}">
      <div class="modal modal-${size}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">${children}</div>
      </div>
    </div>
  `;
}
```

#### VideoPlayer
```typescript
function VideoPlayer({ src, poster, controls = true, autoPlay = false }) {
  return `
    <div class="video-player">
      <video src="${src}" poster="${poster || ''}" 
             ${controls ? 'controls' : ''} 
             ${autoPlay ? 'autoplay' : ''}>
      </video>
    </div>
  `;
}
```

#### FileUploader
```typescript
function FileUploader({ accept = 'image/*,video/*', maxSize = 100 * 1024 * 1024, label }) {
  return `
    <div class="file-uploader">
      <label class="file-uploader-label">
        <span>${label || 'Subir archivo'}</span>
        <input type="file" accept="${accept}" class="file-uploader-input" />
      </label>
      <div class="file-uploader-progress" style="display:none">
        <div class="progress-bar"><div class="progress-fill"></div></div>
      </div>
    </div>
  `;
}
```

#### ChatBubble
```typescript
function ChatBubble({ message, type = 'received', timestamp, isRead = false }) {
  return `
    <div class="chat-bubble chat-${type}">
      <div class="chat-bubble-content">${message}</div>
      <div class="chat-bubble-meta">
        <span class="chat-time">${timestamp}</span>
        ${type === 'sent' ? `<span class="chat-read ${isRead ? 'read' : ''}">✓✓</span>` : ''}
      </div>
    </div>
  `;
}
```

#### DataTable
```typescript
function DataTable({ columns = [], data = [], searchable = false, paginated = false, pageSize = 20 }) {
  return `
    <div class="data-table-wrapper">
      ${searchable ? '<input type="search" class="data-table-search" placeholder="Buscar..." />' : ''}
      <table class="data-table">
        <thead>
          <tr>${columns.map(col => `<th>${col.label}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>${columns.map(col => `<td>${row[col.key] || ''}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
      ${paginated ? `<div class="data-table-pagination">Página 1 de ${Math.ceil(data.length / pageSize)}</div>` : ''}
    </div>
  `;
}
```

#### LineChart
```typescript
function LineChart({ data = [], xKey = 'date', yKey = 'value', label, height = 250 }) {
  // Implementación con Canvas o SVG
  return `<div class="line-chart" style="height: ${height}px">
    <canvas id="chart-${label}" data-x="${xKey}" data-y="${yKey}"></canvas>
  </div>`;
}
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

Usar **Lucide** como librería de iconos principal (versión standalone, sin React):

```bash
npm install lucide
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
