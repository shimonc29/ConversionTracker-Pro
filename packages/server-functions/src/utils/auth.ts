import { auth } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
}

export async function verifyIdToken(idToken: string): Promise<AuthUser | null> {
  try {
    const decodedToken = await auth().verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name
    };
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

export async function checkSitePermission(userId: string, siteId: string): Promise<boolean> {
  try {
    const sitesRef = db.collection('sites');
    const query = sitesRef.where('userId', '==', userId).where('siteId', '==', siteId);
    const snapshot = await query.get();
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking site permission:', error);
    return false;
  }
}

export async function getUserSites(userId: string): Promise<string[]> {
  try {
    const sitesRef = db.collection('sites');
    const query = sitesRef.where('userId', '==', userId);
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => doc.data().siteId);
  } catch (error) {
    console.error('Error getting user sites:', error);
    return [];
  }
} 