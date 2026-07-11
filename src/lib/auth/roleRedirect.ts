import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type UserRole = 'client' | 'trainer' | 'admin';

export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return (data.role as UserRole) || 'client';
    }
    return null;
  } catch (err) {
    console.error('Error getting user role:', err);
    return null;
  }
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'trainer':
      return '/trainer/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'client':
    default:
      return '/client/dashboard';
  }
}

export async function redirectByRole(uid: string): Promise<void> {
  const role = await getUserRole(uid);
  if (role) {
    window.location.href = getDashboardPath(role);
  } else {
    window.location.href = '/client/dashboard';
  }
}
