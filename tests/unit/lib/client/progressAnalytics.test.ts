import { describe, it, expect } from 'vitest';
import {
  calculateMovingAverage,
  calculateReadinessScore,
  detectCortisolRetentionAlert,
  validateWeightChangeSafety,
  normalizeLogDate
} from '@/lib/client/progressAnalytics';
import type { ProgressLog, BioFeedback } from '@/lib/client/progressService';

describe('Progress Analytics & Biometric Engine', () => {
  describe('normalizeLogDate', () => {
    it('debe manejar objetos Timestamp de Firestore con .toDate()', () => {
      const mockDate = new Date('2026-08-21T10:00:00Z');
      const timestamp = { toDate: () => mockDate };
      expect(normalizeLogDate(timestamp).getTime()).toBe(mockDate.getTime());
    });

    it('debe manejar Date nativos e instancias válidas', () => {
      const now = new Date();
      expect(normalizeLogDate(now)).toBe(now);
    });

    it('debe manejar strings ISO', () => {
      const str = '2026-08-21T12:00:00.000Z';
      expect(normalizeLogDate(str).toISOString()).toBe(str);
    });
  });

  describe('calculateMovingAverage', () => {
    it('debe retornar un array vacío si no hay puntos', () => {
      expect(calculateMovingAverage([])).toEqual([]);
    });

    it('debe calcular el promedio móvil de 7 días correctamente', () => {
      const points = [
        { date: new Date('2026-08-01T12:00:00Z'), value: 80.0 },
        { date: new Date('2026-08-02T12:00:00Z'), value: 81.0 },
        { date: new Date('2026-08-03T12:00:00Z'), value: 79.0 },
      ];

      const result = calculateMovingAverage(points, 7);
      expect(result.length).toBe(3);
      expect(result[0]?.movingAverage).toBe(80.0);
      expect(result[1]?.movingAverage).toBe(80.5);
      expect(result[2]?.movingAverage).toBe(80.0);
    });
  });

  describe('calculateReadinessScore', () => {
    it('debe otorgar puntuación óptima con sueño de 8h, energía 9 y estrés bajo', () => {
      const feedback: BioFeedback = {
        sleepHours: 8,
        sleepQuality: 5,
        energyLevel: 9,
        stressLevel: 2,
        doms: 'none',
        waterLitres: 3.0,
      };

      const result = calculateReadinessScore(feedback);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.level).toBe('optimal');
      expect(result.colorClass).toContain('emerald');
    });

    it('debe advertir recuperación requerida si hay privación de sueño y alto estrés', () => {
      const feedback: BioFeedback = {
        sleepHours: 4,
        sleepQuality: 1,
        energyLevel: 3,
        stressLevel: 9,
        doms: 'severe',
        waterLitres: 0.8,
      };

      const result = calculateReadinessScore(feedback);
      expect(result.score).toBeLessThan(50);
      expect(result.level).toBe('recovery_needed');
      expect(result.colorClass).toContain('rose');
    });
  });

  describe('detectCortisolRetentionAlert', () => {
    it('debe alertar si los últimos registros tienen estrés elevado y mal sueño', () => {
      const bioLogs: ProgressLog[] = [
        { id: '1', clientId: 'c1', type: 'biofeedback', date: new Date('2026-08-20'), value: { stressLevel: 9, sleepHours: 5 }, createdAt: {} as any },
        { id: '2', clientId: 'c1', type: 'biofeedback', date: new Date('2026-08-19'), value: { stressLevel: 8, sleepHours: 5.5 }, createdAt: {} as any },
        { id: '3', clientId: 'c1', type: 'biofeedback', date: new Date('2026-08-18'), value: { stressLevel: 8, sleepHours: 5 }, createdAt: {} as any },
      ];

      const result = detectCortisolRetentionAlert([], bioLogs);
      expect(result.hasAlert).toBe(true);
      expect(result.message).toContain('Alerta de Cortisol');
    });

    it('no debe alertar si el estrés es bajo o no hay suficientes registros', () => {
      const bioLogs: ProgressLog[] = [
        { id: '1', clientId: 'c1', type: 'biofeedback', date: new Date('2026-08-20'), value: { stressLevel: 2, sleepHours: 8 }, createdAt: {} as any },
      ];

      const result = detectCortisolRetentionAlert([], bioLogs);
      expect(result.hasAlert).toBe(false);
    });
  });

  describe('validateWeightChangeSafety', () => {
    it('debe detectar una variación fisiológica extrema (>5%) en 24h', () => {
      const result = validateWeightChangeSafety(80, 86); // 7.5% de cambio
      expect(result.isSignificantChange).toBe(true);
      expect(result.percentageDiff).toBe(7.5);
      expect(result.warning).toBeDefined();
    });

    it('debe considerar seguro un cambio menor del 5%', () => {
      const result = validateWeightChangeSafety(80, 80.5); // 0.6% de cambio
      expect(result.isSignificantChange).toBe(false);
      expect(result.warning).toBeUndefined();
    });
  });
});
