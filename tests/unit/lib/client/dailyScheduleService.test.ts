import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscribeToDailySchedule } from '@/lib/client/dailyScheduleService';

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn((_q, onNext) => {
    onNext({ docs: [] });
    return vi.fn();
  }),
}));

describe('DailyScheduleService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería retornar agenda vacía inmediatamente si clientId está vacío', () => {
    const callback = vi.fn();
    const unsub = subscribeToDailySchedule('', callback);

    expect(callback).toHaveBeenCalledWith({ diets: [], workouts: [] });
    expect(typeof unsub).toBe('function');
  });

  it('debería emitir fallback autónomo de rutinas y comidas cuando el cliente no tiene entrenador asignado', () => {
    const callback = vi.fn();
    const unsub = subscribeToDailySchedule('client-autonomous-123', callback);

    expect(callback).toHaveBeenCalled();
    const lastCall = callback.mock.calls[callback.mock.calls.length - 1][0];

    expect(lastCall.workouts.length).toBeGreaterThan(0);
    expect(lastCall.diets.length).toBeGreaterThan(0);
    expect(lastCall.diets[0].meals.length).toBeGreaterThan(0);

    unsub();
  });
});
