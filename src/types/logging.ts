/**
 * Tipos globales para el sistema de logging de CampFit
 */

export interface AppLog {
  timestamp: unknown; // Firestore Timestamp
  hash: string;
  occurrenceCount: number;
  userId: string;
  userEmailHash: string;
  userRole: 'client' | 'trainer' | 'admin' | 'unknown';
  activity: string;
  action: string;
  feature: string;
  relatedUserId?: string;
  relatedUserRole?: string;
  relationType?: string;
  url: string;
  userAgent: string;
  language: string;
  viewport: string;
  level: 'warn' | 'error' | 'critical';
  message: string;
  errorName?: string;
  errorStack?: string;
  errorCode?: string;
  payload?: Record<string, unknown>;
  sessionId: string;
  breadcrumb: string[];
  environment: 'development' | 'staging' | 'production';
}

export interface LogContext {
  activity?: string;
  action?: string;
  feature?: string;
  relatedUserId?: string;
  relatedUserRole?: string;
  relationType?: string;
  payload?: Record<string, unknown>;
  error?: Error | unknown;
}
