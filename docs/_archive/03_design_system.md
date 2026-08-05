# 🎨 Design System - CampFit

> **Última actualización:** 2026-07-31  
> **Estado:** Consolidado en `docs/MASTER.md` (sección 4) y `docs/THEME.md`

---

## 📑 Índice

1. [Principios de Diseño](#1-principios-de-diseño)
2. [Tokens de Diseño](#2-tokens-de-diseño)
3. [Catálogo de Componentes](#3-catálogo-de-componentes)
4. [Responsive Breakpoints](#4-responsive-breakpoints)
5. [Iconos](#5-iconos)

---

## 1. Principios de Diseño

### 1.1 Filosofía

CampFit sigue una filosofía de diseño centrada en el usuario, con foco en la simplicidad, accesibilidad y rendimiento.

### 1.2 Principios Core

1. **Mobile-First:** Todos los componentes se diseñan primero para móvil
2. **Modo Oscuro por Defecto:** La UI principal es dark theme
3. **Consistencia:** Sistema de tokens (colores, tipografía, espaciado)
4. **Accesibilidad:** WCAG 2.1 AA (contrastes, tamaños, roles ARIA)
5. **Animaciones Suaves:** Micro-interacciones para feedback

### 1.3 Metas de Diseño

- **Claridad:** Información fácil de escanear y entender
- **Eficiencia:** Menos clics para completar tareas
- **Feedback:** Respuesta visual a cada acción
- **Previsibilidad:** Comportamiento consistente en toda la app
- **Accesibilidad:** Usable por todos los usuarios

---

## 2. Tokens de Diseño

> **Nota:** Para la documentación completa del sistema de temas, ver `docs/THEME.md`

### 2.1 Colores

#### Paleta Principal (Modo Oscuro)

```css
@theme {
  /* Primarios - Verde Neón */
  --color-primary: #00E676;        /* Acción principal */
  --color-primary-hover: #00C853;  /* Hover */
  --color-primary-dim: #1B5E20;    /* Fondo dim */
  
  /* Secundarios - Azul */
  --color-secondary: #2979FF;      /* Links, información */
  --color-secondary-hover: #2962FF;
  
  /* Fondos */
  --color-bg-primary: #0A0A0A;     /* Fondo principal */
  --color-bg-secondary: #1A1A1A;   /* Tarjetas, paneles */
  --color-bg-tertiary: #2A2A2A;    /* Hover, elementos elevados */
  
  /* Textos */
  --color-text-primary: #FFFFFF;   /* Texto principal */
  --color-text-secondary: #B0B0B0; /* Texto secundario */
  --color-text-disabled: #666666;  /* Texto deshabilitado */
  
  /* Bordes */
  --color-border: #333333;         /* Borde normal */
  --color-border-light: #444444;   /* Borde claro */
  
  /* Estados */
  --color-success: #00E676;        /* Verde */
  --color-warning: #FFD600;        /* Amarillo */
  --color-danger: #FF1744;         /* Rojo */
  --color-info: #2979FF;           /* Azul */
  
  /* Alertas */
  --color-alert-bg: #4A0000;       /* Fondo de alerta */
  --color-alert-border: #FF1744;   /* Borde de alerta */
  
  /* Adherencia */
  --color-green: #00E676;          /* > 90% adherencia */
  --color-yellow: #FFD600;         /* 70-90% adherencia */
  --color-red: #FF1744;            /* < 70% adherencia */
}
```

#### Paleta Principal (Modo Claro)

```css
:root,
[data-theme='light'] {
  /* Primarios - Verde Esmeralda */
  --color-primary: #059669;        /* Acción principal */
  --color-primary-hover: #047857;  /* Hover */
  --color-primary-dim: #d1fae5;    /* Fondo dim */
  
  /* Secundarios - Azul */
  --color-secondary: #2563eb;      /* Links, información */
  --color-secondary-hover: #1d4ed8;
  
  /* Fondos */
  --color-bg-primary: #fafafa;     /* Fondo principal */
  --color-bg-secondary: #f4f4f5;   /* Tarjetas, paneles */
  --color-bg-tertiary: #e4e4e7;    /* Hover, elementos elevados */
  
  /* Textos */
  --color-text-primary: #18181b;   /* Texto principal */
  --color-text-secondary: #52525b; /* Texto secundario */
  --color-text-disabled: #a1a1aa;  /* Texto deshabilitado */
  
  /* Bordes */
  --color-border: #e4e4e7;         /* Borde normal */
  --color-border-light: #d4d4d8;   /* Borde claro */
  
  /* Estados */
  --color-success: #16a34a;        /* Verde */
  --color-warning: #ca8a04;        /* Amarillo */
  --color-danger: #dc2626;         /* Rojo */
  --color-info: #2563eb;           /* Azul */
  
  /* Alertas */
  --color-alert-bg: #fef2f2;       /* Fondo de alerta */
  --color-alert-border: #dc2626;   /* Borde de alerta */
  
  /* Adherencia */
  --color-green: #16a34a;          /* > 90% adherencia */
  --color-yellow: #ca8a04;         /* 70-90% adherencia */
  --color-red: #dc2626;            /* < 70% adherencia */
}
```

### 2.2 Tipografía

```css
:root {
  /* Familias */
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

**Uso:**
- `text-xs`: Labels pequeños, timestamps
- `text-sm`: Textos secundarios, hints
- `text-base`: Texto base, párrafos
- `text-lg`: Subtítulos
- `text-xl`: Títulos de sección
- `text-2xl`: Títulos de página
- `text-3xl`: Títulos principales

### 2.3 Espaciado

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

**Uso:**
- `space-1`: Separación mínima (iconos)
- `space-2`: Espaciado interno de botones
- `space-3`: Separación entre elementos relacionados
- `space-4`: Espaciado estándar
- `space-6`: Separación entre secciones
- `space-8`: Separación entre bloques grandes
- `space-10/12`: Separación entre páginas

### 2.4 Bordes y Sombras

```css
:root {
  /* Radios */
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 10px rgba(0,230,118,0.3);  /* Glow verde neón */
}
```

**Uso:**
- `radius-sm`: Inputs, botones pequeños
- `radius-md`: Cards, modales
- `radius-lg`: Elementos destacados
- `radius-xl`: Modales grandes
- `radius-full`: Avatares, pills

### 2.5 Transiciones

```css
:root {
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

**Uso:**
- `transition-fast`: Hover states
- `transition-normal`: Transiciones de estado
- `transition-slow`: Animaciones de página

---

## 3. Catálogo de Componentes

> **Nota:** Todos los componentes se implementan como archivos `.astro` (Astro components)

### 3.1 Componentes Atómicos

#### Button

**Variantes:**
- `primary` - Acción principal (verde)
- `secondary` - Acción secundaria (azul)
- `outline` - Borde sin fondo
- `ghost` - Sin borde ni fondo
- `danger` - Acción destructiva (rojo)

**Tamaños:**
- `sm` - 32px altura
- `md` - 40px altura (default)
- `lg` - 48px altura

**Estados:**
- `default` - Estado normal
- `hover` - Al pasar el mouse
- `active` - Al hacer clic
- `disabled` - Deshabilitado
- `loading` - Con spinner

**Ejemplo:**
```astro
<Button variant="primary" size="md" loading={false}>
  Guardar Cambios
</Button>
```

#### Input

**Tipos:**
- `text` - Texto plano
- `email` - Email con validación
- `password` - Contraseña con toggle visibilidad
- `number` - Número con controles
- `search` - Búsqueda con icono

**Estados:**
- `default` - Estado normal
- `focused` - Con foco
- `error` - Con mensaje de error
- `disabled` - Deshabilitado

**Ejemplo:**
```astro
<Input 
  type="email" 
  label="Email" 
  placeholder="tu@email.com"
  error={errors.email}
  required
/>
```

#### Select

**Variantes:**
- `default` - Select normal
- `searchable` - Con búsqueda interna

**Ejemplo:**
```astro
<Select 
  label="Rol"
  options={[
    { value: 'client', label: 'Cliente' },
    { value: 'trainer', label: 'Entrenador' },
    { value: 'admin', label: 'Administrador' }
  ]}
  value={user.role}
  onChange={handleRoleChange}
/>
```

#### Slider

**Uso:** RPE (1-10), rangos de valores

**Ejemplo:**
```astro
<Slider 
  min={1} 
  max={10} 
  value={rpe} 
  label="Esfuerzo Percibido"
  showValue
  onChange={setRpe}
/>
```

#### Switch

**Uso:** Toggles de configuración

**Ejemplo:**
```astro
<Switch 
  checked={notificationsEnabled}
  label="Notificaciones"
  onChange={toggleNotifications}
/>
```

#### Badge

**Variantes:**
- `default` - Gris
- `success` - Verde
- `warning` - Amarillo
- `danger` - Rojo
- `info` - Azul

**Ejemplo:**
```astro
<Badge variant="success">Activo</Badge>
<Badge variant="danger">Inactivo</Badge>
```

### 3.2 Componentes Moleculares

#### StatCard

**Uso:** Tarjetas de estadísticas en dashboards

**Props:**
- `icon` - Icono Lucide
- `label` - Título de la estadística
- `value` - Valor principal
- `trend` - Tendencia (up/down/neutral)
- `trendValue` - Valor de tendencia (ej: "+5%")

**Ejemplo:**
```astro
<StatCard 
  icon={Dumbbell}
  label="Rutinas Completadas"
  value="12"
  trend="up"
  trendValue="+3 esta semana"
/>
```

#### ProgressBar

**Props:**
- `value` - Valor actual
- `max` - Valor máximo (default: 100)
- `label` - Etiqueta opcional
- `showPercentage` - Mostrar porcentaje
- `variant` - primary/secondary/success/warning/danger

**Ejemplo:**
```astro
<ProgressBar 
  value={75} 
  max={100}
  label="Adherencia"
  showPercentage
  variant="success"
/>
```

#### AlertBanner

**Variantes:**
- `info` - Azul
- `success` - Verde
- `warning` - Amarillo
- `danger` - Rojo

**Props:**
- `variant` - Tipo de alerta
- `message` - Mensaje a mostrar
- `persistent` - Si se puede cerrar
- `onClose` - Callback al cerrar

**Ejemplo:**
```astro
<AlertBanner 
  variant="warning"
  message="No has registrado tu peso en 3 días"
  onClose={() => setShowAlert(false)}
/>
```

#### EmptyState

**Props:**
- `icon` - Icono Lucide
- `title` - Título
- `description` - Descripción
- `actionLabel` - Texto del botón
- `onAction` - Callback del botón

**Ejemplo:**
```astro
<EmptyState 
  icon={Dumbbell}
  title="No hay rutinas asignadas"
  description="Tu entrenador aún no te ha asignado una rutina"
  actionLabel="Contactar entrenador"
  onAction={() => navigate('/client/chat')}
/>
```

#### ErrorState

**Props:**
- `title` - Título del error
- `message` - Mensaje descriptivo
- `retryLabel` - Texto del botón de reintento
- `onRetry` - Callback de reintento

**Ejemplo:**
```astro
<ErrorState 
  title="Error al cargar datos"
  message="No se pudo conectar con el servidor"
  retryLabel="Reintentar"
  onRetry={loadData}
/>
```

#### LoadingSpinner

**Tamaños:**
- `sm` - 16px
- `md` - 24px (default)
- `lg` - 40px

**Variantes:**
- `default` - Spinner centrado
- `inline` - Spinner en línea con texto

**Ejemplo:**
```astro
<LoadingSpinner size="md" />
<LoadingSpinner variant="inline" text="Cargando..." />
```

#### Skeleton

**Variantes:**
- `text` - Línea de texto
- `rect` - Rectángulo
- `circle` - Círculo

**Props:**
- `width` - Ancho (px o %)
- `height` - Alto (px o %)
- `className` - Clases adicionales

**Ejemplo:**
```astro
<Skeleton variant="text" width="96px" height="16px" />
<Skeleton variant="rect" width="100%" height="200px" />
<Skeleton variant="circle" width="40px" height="40px" />
```

#### SkeletonGroup

**Variantes:**
- `card-grid` - Grid de cards
- `list` - Lista de items
- `table` - Tabla de datos

**Props:**
- `count` - Número de items (card-grid y list)
- `rows` - Número de filas (table)
- `cols` - Número de columnas (table)

**Ejemplo:**
```astro
<SkeletonGroup variant="card-grid" count={6} />
<SkeletonGroup variant="list" count={4} />
<SkeletonGroup variant="table" rows={5} cols={4} />
```

#### LoadingState

**Variantes:**
- `inline` - En línea con texto
- `centered` - Centrado en contenedor

**Tipos:**
- `spinner` - Spinner animado
- `skeleton` - Placeholder skeleton

**Tamaños:**
- `sm` - 16px
- `md` - 24px
- `lg` - 40px

**Ejemplo:**
```astro
<LoadingState variant="inline" type="spinner" size="sm" />
<LoadingState variant="centered" type="skeleton" />
```

#### PageTransition

**Animaciones:**
- `fade-up` - Fade in con movimiento hacia arriba
- `fade-in` - Fade in simple
- `scale` - Escala desde 0.95 a 1
- `slide` - Deslizamiento desde la derecha

**Props:**
- `animation` - Tipo de animación
- `duration` - Duración en ms (default: 300)

**Ejemplo:**
```astro
<PageTransition animation="fade-up">
  <!-- contenido de la página -->
</PageTransition>
```

#### AnimatedCounter

**Props:**
- `value` - Valor final
- `duration` - Duración en ms (default: 1000)
- `easing` - Función de easing (default: ease-out)

**Ejemplo:**
```astro
<AnimatedCounter value={75} duration={1000} />
```

### 3.3 Componentes Organismos

#### TabBar

**Uso:** Navegación por pestañas

**Props:**
- `tabs` - Array de tabs `{ id, label, icon? }`
- `activeTab` - Tab activo
- `onChange` - Callback al cambiar

**Ejemplo:**
```astro
<TabBar 
  tabs={[
    { id: 'lun', label: 'Lun' },
    { id: 'mar', label: 'Mar' },
    { id: 'mie', label: 'Mié' }
  ]}
  activeTab={activeDay}
  onChange={setActiveDay}
/>
```

#### Modal

**Props:**
- `open` - Si está abierto
- `title` - Título del modal
- `size` - sm/md/lg (default: md)
- `onClose` - Callback al cerrar

**Características:**
- Focus trap
- Cierre con Escape
- No cierra con clic fuera
- Overlay con blur

**Ejemplo:**
```astro
<Modal 
  open={isModalOpen} 
  title="Confirmar Acción"
  onClose={() => setIsModalOpen(false)}
>
  <p>¿Estás seguro?</p>
  <Button variant="primary" onclick={handleConfirm}>Confirmar</Button>
</Modal>
```

#### ConfirmModal

**Props:**
- `open` - Si está abierto
- `title` - Título
- `message` - Mensaje de confirmación
- `confirmLabel` - Texto botón confirmar
- `cancelLabel` - Texto botón cancelar
- `onConfirm` - Callback confirmar
- `onCancel` - Callback cancelar
- `variant` - danger/warning/info

**Ejemplo:**
```astro
<ConfirmModal
  open={showDeleteModal}
  title="Eliminar usuario"
  message="Esta acción no se puede deshacer"
  confirmLabel="Eliminar"
  cancelLabel="Cancelar"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => setShowDeleteModal(false)}
/>
```

#### DataTable

**Props:**
- `columns` - Array de columnas `{ key, label, sortable? }`
- `data` - Array de datos
- `searchable` - Si tiene búsqueda
- `paginated` - Si tiene paginación
- `pageSize` - Items por página

**Características:**
- Ordenamiento por columna
- Búsqueda en tiempo real
- Paginación
- Responsive (scroll horizontal en móvil)

**Ejemplo:**
```astro
<DataTable 
  columns={[
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol' }
  ]}
  data={users}
  searchable
  paginated
  pageSize={10}
/>
```

#### LineChart

**Props:**
- `data` - Array de puntos `{ x, y }`
- `xKey` - Key para eje X
- `yKey` - Key para eje Y
- `label` - Etiqueta del gráfico
- `height` - Altura en px (default: 250)

**Características:**
- SVG nativo (sin librerías externas)
- Auto-scaling
- Tooltips al hover
- Responsive

**Ejemplo:**
```astro
<LineChart 
  data={weightHistory}
  xKey="date"
  yKey="weight"
  label="Evolución de Peso"
  height={250}
/>
```

#### ChatBubble

**Props:**
- `message` - Contenido del mensaje
- `type` - sent/received
- `timestamp` - Fecha/hora
- `isRead` - Si fue leído

**Ejemplo:**
```astro
<ChatBubble 
  message="¡Hola! ¿Cómo va el entrenamiento?"
  type="sent"
  timestamp="10:30"
  isRead={true}
/>
```

#### FileUploader

**Props:**
- `accept` - Tipos de archivo (default: 'image/*')
- `maxSize` - Tamaño máximo en bytes
- `label` - Texto del botón
- `onUpload` - Callback al subir

**Características:**
- Drag and drop
- Preview de imagen
- Validación de tipo y tamaño
- Progreso de subida

**Ejemplo:**
```astro
<FileUploader 
  accept="image/*"
  maxSize={5 * 1024 * 1024}  // 5MB
  label="Subir foto de progreso"
  onUpload={handlePhotoUpload}
/>
```

---

## 4. Responsive Breakpoints

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

### 4.1 Estrategia Mobile-First

1. **Diseño base (móvil):** Layout vertical, navegación inferior
2. **Tablet (md):** Sidebar colapsable, más espacio horizontal
3. **Desktop (lg):** Sidebar permanente, layout de 3 columnas

### 4.2 Layouts por Dispositivo

#### Móvil (< 768px)
- Bottom navigation
- Cards apiladas verticalmente
- Modales a pantalla completa
- Tablas con scroll horizontal

#### Tablet (768px - 1023px)
- Sidebar colapsable
- Grid de 2 columnas
- Modales centrados
- Tablas adaptadas

#### Desktop (≥ 1024px)
- Sidebar permanente
- Grid de 3 columnas
- Modales centrados
- Tablas completas

---

## 5. Iconos

### 5.1 Librería

**Lucide Icons** (versión standalone, sin React)

```bash
npm install lucide
```

### 5.2 Iconos por Contexto

#### Rutinas y Ejercicios
- `Dumbbell` - Rutinas/ejercicios
- `Play` - Iniciar/Reproducir
- `Check` - Completado
- `Circle` - Pendiente

#### Nutrición
- `Apple` - Dietas/nutrición
- `Utensils` - Comidas
- `Flame` - Calorías
- `Beef` - Proteínas
- `Wheat` - Carbohidratos
- `Droplets` - Grasas

#### Progreso
- `TrendingUp` - Progreso
- `Camera` - Fotos
- `Scale` - Peso
- `BarChart3` - Estadísticas

#### Chat y Comunicación
- `MessageCircle` - Chat
- `Send` - Enviar mensaje
- `Bell` - Alertas/notificaciones
- `AlertTriangle` - Llamados de atención

#### Usuarios y Roles
- `User` - Perfil
- `Users` - Grupo de usuarios
- `Shield` - Seguridad/Admin
- `Settings` - Configuración

#### Navegación
- `Home` - Inicio
- `Menu` - Menú hamburguesa
- `X` - Cerrar
- `ChevronLeft` - Atrás
- `ChevronRight` - Adelante
- `Search` - Búsqueda

#### Acciones
- `Plus` - Añadir
- `Edit` - Editar
- `Trash2` - Eliminar
- `Save` - Guardar
- `RefreshCw` - Recargar
- `Download` - Descargar
- `Upload` - Subir

#### Estados
- `CheckCircle` - Éxito
- `XCircle` - Error
- `AlertCircle` - Advertencia
- `Info` - Información
- `Loader` - Cargando

### 5.3 Uso de Iconos

```astro
<!-- Importar icono -->
<script>
  import { Dumbbell } from 'lucide';
</script>

<!-- Usar icono -->
<Dumbbell size={24} class="text-primary" />

<!-- Con props -->
<Dumbbell 
  size={24} 
  strokeWidth={2}
  class="theme-text-primary"
/>
```

---

## 🎨 Guía de Estilos

### 6.1 Espaciado

- **Mínimo:** 4px (space-1)
- **Estándar:** 16px (space-4)
- **Máximo:** 48px (space-12)

### 6.2 Tipografía

- **Títulos:** Bold (700)
- **Cuerpo:** Normal (400)
- **Énfasis:** Medium (500)

### 6.3 Colores

- **Primario:** Verde neón (acciones principales)
- **Secundario:** Azul (información)
- **Éxito:** Verde
- **Advertencia:** Amarillo
- **Error:** Rojo

### 6.4 Sombras

- **Cards:** shadow-md
- **Modales:** shadow-lg
- **Elevado:** shadow-lg + glow

---

## 🔗 Referencias

- **Documentación Maestra:** `docs/MASTER.md` (sección 4)
- **Sistema de Temas:** `docs/THEME.md`
- **Accesibilidad:** `docs/ACCESIBILIDAD.md`
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev

---

**Documento creado:** 2026-06-13  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit