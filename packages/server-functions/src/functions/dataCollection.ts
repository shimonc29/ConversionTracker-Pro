import { https } from 'firebase-functions';
import { Request, Response } from 'express';
import { validateBatch } from '../utils/validator';
import { logInfo, logError } from '../utils/logger';
import { storeRaw } from '../services/eventStore';

export const dataCollectionHandler = https.onRequest(async (req: Request, res: Response) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    const events = validateBatch(req.body.events);
    if (!events.length) {
      logError('No valid events found', { body: req.body });
      return res.status(400).json({ error: 'No valid events found' });
    }
    await storeRaw(events);
    logInfo(`Processed ${events.length} events`);
    res.status(200).json({ success: true, processed: events.length });
  } catch (error) {
    logError('Data collection error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}); 