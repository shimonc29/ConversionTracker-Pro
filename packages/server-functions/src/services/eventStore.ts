import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

export async function storeRaw(events: any[]): Promise<void> {
  try {
    const batch = db.batch();
    
    for (const event of events) {
      const eventRef = db.collection('events').doc();
      batch.set(eventRef, {
        ...event,
        createdAt: new Date(),
        id: eventRef.id
      });
    }
    
    await batch.commit();
    console.log(`Successfully stored ${events.length} events in Firestore`);
  } catch (error) {
    console.error('Error storing events in Firestore:', error);
    throw error;
  }
}

export async function getEventsBySiteId(siteId: string, limit: number = 100): Promise<any[]> {
  try {
    const snapshot = await db
      .collection('events')
      .where('siteId', '==', siteId)
      .orderBy('clientTimestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching events from Firestore:', error);
    throw error;
  }
}

export async function getConversionsBySiteId(siteId: string, limit: number = 100): Promise<any[]> {
  try {
    const snapshot = await db
      .collection('events')
      .where('siteId', '==', siteId)
      .where('type', '==', 'conversion')
      .orderBy('clientTimestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching conversions from Firestore:', error);
    throw error;
  }
}

export async function getPageViewsBySiteId(siteId: string, limit: number = 100): Promise<any[]> {
  try {
    const snapshot = await db
      .collection('events')
      .where('siteId', '==', siteId)
      .where('type', '==', 'page_view')
      .orderBy('clientTimestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching page views from Firestore:', error);
    throw error;
  }
}
