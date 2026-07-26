import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';

export type UserRole = 'client' | 'trainer' | 'admin';

export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return (data.role as UserRole) || 'client';
    }
    
    // Check bootstrap admin emails
    const currentUser = auth.currentUser;
    const email = (currentUser?.email || '').toLowerCase();
    if (email === 'servicioweb.pmi@gmail.com' || email === 'sevicioweb.pmi@gmail.com' || email.startsWith('admin')) {
      return 'admin';
    }
    return 'client';
  } catch (err) {
    logger.error('RoleRedirect', 'Error getting user role', err);
    return 'client';
  }
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'trainer':
      return '/trainer/dashboard';
    case 'client':
    default:
      return '/client/dashboard';
  }
}

export async function redirectByRole(uid: string): Promise<void> {
  const role = await getUserRole(uid);
  const targetPath = getDashboardPath(role);
  
  // Evitar redirigir a la misma ruta si ya estamos en ella
  if (window.location.pathname !== targetPath && window.location.pathname !== `${targetPath}/`) {
    window.location.href = targetPath;
  }
}
