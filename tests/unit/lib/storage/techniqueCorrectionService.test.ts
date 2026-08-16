import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  submitTechniqueVideo,
  reviewTechniqueCorrection,
  deleteTechniqueCorrection,
} from '@/lib/shared/techniqueCorrectionService';

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn((_db, col, id) => ({ path: `${col}/${id}` })),
  addDoc: vi.fn().mockImplementation(() => Promise.resolve({ id: 'mock-correction-123' })),
  updateDoc: vi.fn().mockImplementation(() => Promise.resolve(undefined)),
  deleteDoc: vi.fn().mockImplementation(() => Promise.resolve(undefined)),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => ({ toDate: () => new Date() })),
}));

describe('Technique Correction Service & R2 Video Feedback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('submitTechniqueVideo', () => {
    it('debería subir el vídeo del alumno a Cloudflare R2 y registrar la corrección', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/technique-feedback/client-1/squat-123.mp4',
          key: 'technique-feedback/client-1/squat-123.mp4',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);

      const videoFile = new File(['mock-video-binary'], 'squat.mp4', { type: 'video/mp4' });
      const result = await submitTechniqueVideo({
        clientId: 'client-1',
        clientName: 'Juan Pérez',
        trainerId: 'trainer-99',
        workoutId: 'workout-w1',
        workoutName: 'Pierna Élite',
        exerciseId: 'ex-squat',
        exerciseName: 'Sentadilla Trasera',
        file: videoFile,
        notes: 'Siento que el talón se me levanta al llegar al fondo',
      });

      expect(result.id).toBeTruthy();
      expect(result.clientId).toBe('client-1');
      expect(result.trainerId).toBe('trainer-99');
      expect(result.exerciseName).toBe('Sentadilla Trasera');
      expect(result.videoUrl).toContain('technique-feedback/client-1');
      expect(result.status).toBe('pending');
      expect(result.clientNotes).toContain('talón se me levanta');
    });

    it('debería rechazar formatos no permitidos para técnica', async () => {
      const invalidFile = new File(['text'], 'log.txt', { type: 'text/plain' });

      await expect(
        submitTechniqueVideo({
          clientId: 'client-1',
          clientName: 'Juan',
          trainerId: 'trainer-1',
          workoutId: 'w-1',
          workoutName: 'Rutina',
          exerciseId: 'ex-1',
          exerciseName: 'Press',
          file: invalidFile,
        })
      ).rejects.toThrow();
    });
  });

  describe('reviewTechniqueCorrection', () => {
    it('debería actualizar el estado a reviewed y guardar el feedback del entrenador', async () => {
      await expect(
        reviewTechniqueCorrection(
          'mock-correction-123',
          'Excelente profundidad, pero abre las rodillas hacia afuera al bajar para mayor estabilidad.'
        )
      ).resolves.toBeUndefined();
    });

    it('debería lanzar error si el ID está vacío', async () => {
      await expect(reviewTechniqueCorrection('', 'Feedback')).rejects.toThrow('ID de corrección requerido');
    });
  });

  describe('deleteTechniqueCorrection', () => {
    it('debería eliminar el documento de corrección', async () => {
      await expect(deleteTechniqueCorrection('mock-correction-123')).resolves.toBeUndefined();
    });
  });
});
