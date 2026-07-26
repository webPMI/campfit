/**
 * Barrel de exportaciones para el módulo de administración.
 * Re-exporta todas las funciones desde los submódulos especializados.
 *
 * @module adminUtils
 */

export type { AdminUser, CreateUserPayload } from './types';

export { requireAdmin, signOutUser } from './adminAuth';
export {
  createUser,
  updateUserRole,
  assignTrainer,
  deleteUser,
  toggleUserBlock,
  getUserName,
  getUserProfile,
} from './adminUsers';
export {
  subscribeToUsers,
  subscribeToUsersByRole,
  subscribeToCollectionCount,
  subscribeToRecentUsers,
  getTrainerClientCount,
} from './adminSubscriptions';
export {
  renderUserRow,
  renderUserDetail,
  renderUserForm,
  renderUserCard,
  renderUserCardExtended,
  renderClientCard,
  renderTrainerCard,
} from './adminRender';
export { initGlobalActions, initAdminActions } from './adminInit';
