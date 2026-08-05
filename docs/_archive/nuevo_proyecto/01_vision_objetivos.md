# 🎯 Visión y Objetivos - CampFit 2.0

## Visión del Producto

**CampFit** es una plataforma integral de fitness y entrenamiento personalizado que conecta a entrenadores con sus alumnos, eliminando la fricción de la gestión manual y proporcionando una experiencia premium, fluida y altamente interactiva tanto en web como en dispositivos móviles.

---

## Objetivos de Negocio

| Objetivo | Descripción | KPI |
|----------|-------------|-----|
| **Transformación física** | Guiar a los alumnos en su cambio de hábitos y condición física | % de alumnos que completan >70% de adherencia mensual |
| **Eficiencia del entrenador** | Reducir el tiempo administrativo de Seba en la gestión de planes | Tiempo promedio de asignación de plan < 15 min |
| **Retención de alumnos** | Mantener engagement mediante seguimiento y comunicación directa | Tasa de retención mensual > 85% |
| **Escalabilidad** | Permitir que Seba gestione más alumnos sin perder calidad | Alumnos activos por entrenador (target: 50+) |

---

## Principios de Diseño

1. **Mobile-First**: La experiencia principal es en teléfonos, optimizada para escritorio
2. **Tiempo Real**: Los datos se sincronizan instantáneamente (Firestore streams)
3. **Offline-Resilient**: La app funciona en zonas de baja conectividad
4. **Oscuro por Defecto**: UI en modo oscuro como experiencia principal
5. **Accesible**: Cumplimiento de estándares WCAG 2.1 AA

---

## Audiencia Objetivo

### Alumnos
- Personas de 18-50 años que buscan transformación física
- Nivel de experiencia: principiante a avanzado
- Dispositivo principal: móvil (Android/iOS)
- Necesidad: guía clara, motivación, seguimiento

### Entrenadores
- Perfil: Seba (admin) y futuros trainers
- Dispositivo principal: escritorio + móvil
- Necesidad: eficiencia, control, personalización

---

## Diferenciadores Clave

1. **Planes con video demostrativo**: Cada ejercicio tiene su video instructivo
2. **Validación médica inteligente**: El sistema alerta sobre conflictos entre planes y perfil médico
3. **Chat 1:1 con alertas**: Comunicación directa con sistema de "llamados de atención"
4. **Somatotipos en nutrición**: Dietas clasificadas por ectomorfo, mesomorfo, endomorfo
5. **Sin costo de egress**: Cloudflare R2 elimina costos de transferencia de videos
