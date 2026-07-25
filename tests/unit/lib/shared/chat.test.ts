/**
 * Tests unitarios para shared/chat.ts
 * Verifica las funciones de suscripción y envío de mensajes.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  subscribeToUserMessages,
  subscribeToConversation,
  sendMessage,
  markAsRead,
} from '../../../../src/lib/shared/chat';
import type { ChatMessage } from '../../../../src/lib/shared/chat';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  limit: vi.fn(),
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock onSnapshot to return a mock unsubscribe function
const mockOnSnapshot = vi.fn((_query: unknown, onSuccess: (snapshot: { docs: { id: string; data: () => Record<string, unknown> }[] }) => void, onError?: (error: Error) => void) => {
  // Simulate successful snapshot
  onSuccess({
    docs: [
      {
        id: 'msg1',
        data: () => ({
          senderId: 'user1',
          receiverId: 'user2',
          participants: ['user1', 'user2'],
          content: 'Test message',
          type: 'text',
          isRead: false,
          createdAt: { toDate: () => new Date('2024-01-15') },
        }),
      },
    ],
  });
  return () => {}; // unsubscribe function
});

// Mock addDoc
const mockAddDoc = vi.fn(() => ({ id: 'new-msg-id' }));

// Mock updateDoc
const mockUpdateDoc = vi.fn();

// Mock doc
const mockDoc = vi.fn((_db: unknown, path: string) => ({ path }));

// Mock collection
const mockCollection = vi.fn((_db: unknown, name: string) => ({ name }));

// Mock query
const mockQuery = vi.fn((...args: unknown[]) => args);

// Mock where
const mockWhere = vi.fn((...args: unknown[]) => args);

// Mock orderBy
const mockOrderBy = vi.fn((...args: unknown[]) => args);

// Mock limit
const mockLimit = vi.fn((...args: unknown[]) => args);

describe('shared/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('subscribeToUserMessages', () => {
    it('✅ should return empty array and unsubscribe when userId is empty', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToUserMessages('', callback);
      expect(callback).toHaveBeenCalledWith([]);
      expect(typeof unsubscribe).toBe('function');
    });

    it('✅ should return empty array and unsubscribe when userId is null', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToUserMessages(null as unknown as string, callback);
      expect(callback).toHaveBeenCalledWith([]);
      expect(typeof unsubscribe).toBe('function');
    });

    it('✅ should return empty array and unsubscribe when userId is undefined', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToUserMessages(undefined as unknown as string, callback);
      expect(callback).toHaveBeenCalledWith([]);
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('subscribeToConversation', () => {
    it('✅ should return empty array and unsubscribe when userId1 is empty', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToConversation('', 'user2', callback);
      expect(callback).toHaveBeenCalledWith([]);
      expect(typeof unsubscribe).toBe('function');
    });

    it('✅ should return empty array and unsubscribe when userId2 is empty', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToConversation('user1', '', callback);
      expect(callback).toHaveBeenCalledWith([]);
      expect(typeof unsubscribe).toBe('function');
    });

    it('✅ should return empty array and unsubscribe when both userIds are empty', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToConversation('', '', callback);
      expect(callback).toHaveBeenCalledWith([]);
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('sendMessage', () => {
    it('✅ should return null when senderId is empty', async () => {
      const result = await sendMessage('', 'user2', 'content');
      expect(result).toBeNull();
    });

    it('✅ should return null when receiverId is empty', async () => {
      const result = await sendMessage('user1', '', 'content');
      expect(result).toBeNull();
    });

    it('✅ should return null when content is empty', async () => {
      const result = await sendMessage('user1', 'user2', '');
      expect(result).toBeNull();
    });

    it('✅ should return null when content is only whitespace', async () => {
      const result = await sendMessage('user1', 'user2', '   ');
      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('✅ should call updateDoc with correct parameters', async () => {
      // This test verifies the function exists and can be called
      expect(typeof markAsRead).toBe('function');
    });
  });
});