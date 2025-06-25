import { onRequest } from 'firebase-functions/v2/https';
import { validateBatch } from '../utils/validator';
import { logInfo, logError } from '../utils/logger';
import { storeRaw } from '../services/eventStore';
import { RateLimiter } from '../utils/rateLimiter';

const rateLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 10 }); // 10 requests per minute

const mockConversions = [
  {
    conversionId: 'c1',
    siteId: 'mysite',
    userId: 'u1',
    conversionType: 'purchase',
    value: 100,
    currency: 'USD',
    timestamp: '2024-06-01T10:00:00Z',
    attributedSource: 'Google',
    attributionModel: 'last_click',
    confidence: 0.9,
    touchpointCount: 2,
    attributionPath: [
      {
        source: 'Google',
        medium: 'cpc',
        timestamp: '2024-06-01T09:00:00Z',
        url: 'https://mysite.com',
      },
      {
        source: 'Direct',
        medium: 'none',
        timestamp: '2024-06-01T10:00:00Z',
        url: 'https://mysite.com',
      },
    ],
  },
  {
    conversionId: 'c2',
    siteId: 'mysite',
    userId: 'u2',
    conversionType: 'signup',
    value: 0,
    currency: 'USD',
    timestamp: '2024-06-02T12:00:00Z',
    attributedSource: 'Facebook',
    attributionModel: 'first_click',
    confidence: 0.8,
    touchpointCount: 1,
    attributionPath: [
      {
        source: 'Facebook',
        medium: 'cpc',
        timestamp: '2024-06-02T12:00:00Z',
        url: 'https://mysite.com',
      },
    ],
  },
];

export const api = onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const clientIP =
    req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  
  // Rate limiting for data collection endpoint
  if (req.path === '/collect' && !rateLimiter.isAllowed(clientIP.toString())) {
    logError('Rate limit exceeded', { ip: clientIP });
    res.status(429).json({ error: 'Rate limit exceeded' });
    return;
  }

  try {
    // Route based on path
    if (req.path === '/collect' || req.path === '/api/collect') {
      // Data collection endpoint
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const events = validateBatch(req.body.events);
      if (!events.length) {
        logError('No valid events found', { body: req.body });
        res.status(400).json({ error: 'No valid events found' });
        return;
      }
      
      await storeRaw(events);
      logInfo(`Processed ${events.length} events`);
      res.status(200).json({ success: true, processed: events.length });
      
    } else if (req.path === '/conversions' || req.path === '/api/conversions') {
      // Get conversions endpoint
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      res.status(200).json({ conversions: mockConversions });
      
    } else if (req.path === '/' || req.path === '/api') {
      // Root endpoint - show API info
      res.status(200).json({
        message: 'Conversion Tracker API',
        version: '1.0.0',
        endpoints: {
          collect: {
            method: 'POST',
            path: '/collect',
            description: 'Submit conversion events'
          },
          conversions: {
            method: 'GET',
            path: '/conversions',
            description: 'Get conversion data'
          }
        }
      });
      
    } else {
      // 404 for unknown paths
      res.status(404).json({ error: 'Endpoint not found' });
    }
    
  } catch (error) {
    logError('API error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}); 