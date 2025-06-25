import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

export interface Site {
  id: string;
  name: string;
  url: string;
  siteId: string;
  userId: string;
  createdAt: Date;
}

export const siteService = {
  // Create a new site for a user
  async createSite(userId: string, name: string, url: string): Promise<Site> {
    const siteId = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    const siteData = {
      name,
      url,
      siteId,
      userId,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'sites'), siteData);
    
    return {
      id: docRef.id,
      ...siteData
    };
  },

  // Get all sites for a user
  async getUserSites(userId: string): Promise<Site[]> {
    const q = query(collection(db, 'sites'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Site[];
  },

  // Delete a site
  async deleteSite(siteId: string): Promise<void> {
    await deleteDoc(doc(db, 'sites', siteId));
  }
}; 