# Notificaciones y Soporte Multimedia en Chat

## 1. Visión General

El sistema de mensajería de **CampFit** conecta en tiempo real a Clientes, Entrenadores y Administradores a través de Firestore. Esta característica añade:
1. **Soporte Multimedia (Cloudflare R2 / Previsualización reactiva)**: Envío de fotos y vídeos de corrección postural y técnica de ejercicios.
2. **Notificaciones Push y Locales**: Alertas de navegador automáticas cuando llegan nuevos mensajes o llamados de atención estando en segundo plano, respetando las preferencias de notificación granulares del usuario.

---

## 2. Flujo de Envío Multimedia

```
[Usuario / Entrenador]
       │
       ▼ (Selecciona archivo 📷 / 🎥)
[uploadChatMedia() en r2Service.ts]
       │
       ├── Cloudflare R2 Worker / Endpoint configurado: subida HTTP POST -> URL Pública
       └── Fallback reactivo seguro: Data URL
       │
       ▼
[sendMessage() en trainerChat.ts / client chat]
       │
       ▼ Guarda en colección 'messages' con type='media', mediaUrl, mediaType
       │
[Burbuja de Chat renderMessageBubble()]
       ├── Imagen: <img> interactiva con zoom en pestaña nueva
       └── Vídeo: <video controls> optimizado
```

---

## 3. Notificaciones en Segundo Plano

- **Activación**: Se evalúa `document.hidden` y si `isCategoryEnabled(user, 'clientChat' | 'trainerChat')` está activo.
- **Servicio**: `showLocalNotification()` despliega la notificación del sistema operativo si los permisos están concedidos.

---

## 4. Archivos Clave

- `src/lib/storage/r2Service.ts`: Servicio de subida a Cloudflare R2 con validación de tipos y tamaño.
- `src/lib/trainer/trainerChat.ts`: Función `sendMessage` con parámetros de `mediaUrl` y `mediaType`.
- `src/lib/trainer/trainerRender.ts`: `renderMessageBubble` con soporte responsivo de imágenes y reproductores de vídeo.
- `src/pages/client/chat.astro`: Vista cliente con botón de adjunto `📎`, previsualización y notificaciones.
- `src/pages/trainer/chat.astro`: Vista entrenador con soporte multimedia y filtros por rol.
