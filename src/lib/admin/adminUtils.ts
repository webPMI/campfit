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
  updateUserProfile,
  deleteUser,
  toggleUserBlock,
  getUserName,
  getUserProfile,
} from './adminUsers';
export {
  subscribeToUsers,
  subscribeToUsersByRole,
  subscribeToTrainers,
  subscribeToCollectionCount,
  subscribeToRecentUsers,
  getTrainerClientCount,
  subscribeToWorkoutCounts,
  subscribeToDietCounts,
  type TrainerOption,
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
