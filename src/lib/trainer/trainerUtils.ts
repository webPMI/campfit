/**
 * Barrel de exportaciones para el módulo de entrenador.
 * Re-exporta todas las funciones desde los submódulos especializados.
 *
 * @module trainerUtils
 */

export type {
  TrainerClient,
  TrainerWorkout,
  Exercise,
  TrainerDiet,
  Meal,
  TrainerMessage,
  ProgressLog,
} from './types';

export { requireAuth, signOutUser } from './trainerAuth';
export {
  subscribeToClients,
  getClientProfile,
  getClientAdherenceStatus,
  saveTrainerPrivateNotes,
} from './trainerClients';
export {
  subscribeToWorkoutsByTrainer,
  subscribeToWorkoutsByClient,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  cloneWorkoutToClient,
} from './trainerWorkouts';
export {
  subscribeToDietsByTrainer,
  subscribeToDietsByClient,
  createDiet,
  updateDiet,
  deleteDiet,
  cloneDietToClient,
} from './trainerDiets';
export { calculateMetabolicPlan, type MacroPlan, type ActivityLevel } from './metabolicCalculator';
export { subscribeToClientProgress } from './trainerProgress';
export {
  subscribeToConversations,
  subscribeToConversation,
  sendMessage,
  markAsRead,
} from './trainerChat';
export {
  renderClientCard,
  renderWorkoutCard,
  renderDietCard,
  renderMessageBubble,
} from './trainerRender';
export { initGlobalActions } from './trainerInit';

