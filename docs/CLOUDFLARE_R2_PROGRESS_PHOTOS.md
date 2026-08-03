# Guía Técnica: Subida de Fotos de Evolución a Cloudflare R2

Esta documentación detalla la integración del servicio de almacenamiento **Cloudflare R2 Object Storage** para las fotos de progreso y evolución corporal en **CampFit**.

---

## 1. Arquitectura de Almacenamiento

Las fotos de evolución física (vistas `Frontal`, `Perfil` y `Espalda`) del cliente se gestionan a través del módulo de servicio `src/lib/storage/r2Service.ts`.

### Ventajas de Cloudflare R2
- **Cero Costos de Egresos (No Egress Fees):** Tráfico de lectura sin costes por descarga de imágenes.
- **Rendimiento Global Edge:** Latencia ultra-baja en la entrega de imágenes mediante la red de Cloudflare CDN.
- **Seguridad y Privacidad:** Acceso mediante presigned URLs o dominios configurados (`cdn.campfit.app`).

---

## 2. Estructura de Claves de Objetos (R2 Bucket Keying)

Las fotos se organizan jerárquicamente en el bucket `campfit-progress-photos` siguiendo el patrón:

```
clients/{clientId}/progress/{angle}_{timestamp}.{ext}
```

**Ejemplo:**
`clients/usr_12345/progress/front_1722602400000.jpg`

---

## 3. Flujo de Subida del Cliente

1. **Validación en Cliente (`validateImageFile`):**
   - Comprobación de formato (`JPEG`, `PNG`, `WebP`, `HEIC`).
   - Límite de tamaño máximo (10 MB).
2. **Previsualización Reactiva (`generateLocalPreview`):**
   - Generación de DataURL para previsualización inmediata en la interfaz mientras se procesa la subida.
3. **Petición a Cloudflare R2 (`uploadProgressPhotoToR2`):**
   - Envío multipart a la API / Worker de Cloudflare R2.
   - Retorno de URL de imagen pública / firmada.
4. **Almacenamiento en Firestore (`registerProgressPhoto`):**
   - Se crea un documento en la colección `progress_logs` con metadatos: `photoUrl`, `angle`, `storageProvider: "cloudflare_r2"`, `date`.

---

## 4. Estructura del Documento en Firestore (`progress_logs`)

```ts
export interface ProgressPhotoLog {
  id: string;
  clientId: string;
  type: 'photo';
  date: Timestamp;
  value: {
    photoUrl: string;
    angle: 'front' | 'side' | 'back';
    notes?: string;
    storageProvider: 'cloudflare_r2';
  };
  createdAt: Timestamp;
}
```
