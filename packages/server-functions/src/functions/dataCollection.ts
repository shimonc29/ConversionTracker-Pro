import { onRequest } from 'firebase-functions/v2/https';
import { validateBatch } from '../utils/validator';
import { logInfo, logError } from '../utils/logger';
import { storeRaw } from '../services/eventStore';
import { RateLimiter } from '../utils/rateLimiter';

const rateLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 10 }); // 10 requests per minute

export const dataCollectionHandler = onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const clientIP =
    req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  if (!rateLimiter.isAllowed(clientIP.toString())) {
    logError('Rate limit exceeded', { ip: clientIP });
    res.status(429).json({ error: 'Rate limit exceeded' });
    return;
  }

  try {
    const events = validateBatch(req.body.events);
    if (!events.length) {
      logError('No valid events found', { body: req.body });
      res.status(400).json({ error: 'No valid events found' });
      return;
    }
    await storeRaw(events);
    logInfo(`Processed ${events.length} events`);
    res.status(200).json({ success: true, processed: events.length });
  } catch (error) {
    logError('Data collection error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
