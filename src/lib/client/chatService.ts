/**
 * Servicio de chat para clientes.
 * Ahora delega en el módulo compartido @/lib/shared/chat.
 *
 * @module client/chatService
 * @deprecated Usar @/lib/shared/chat directamente
 */

export type { ChatMessage } from '@/lib/shared/chat';
export { subscribeToUserMessages, subscribeToConversation, sendMessage, markAsRead } from '@/lib/shared/chat';
