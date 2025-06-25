import { onRequest } from 'firebase-functions/v2/https';
import { validateBatch, extractUTMParameters, extractReferrerInfo } from '../utils/validator';
import { logInfo, logError } from '../utils/logger';
import { storeRaw, getConversionsBySiteId, getEventsBySiteId } from '../services/eventStore';
import { RateLimiter } from '../utils/rateLimiter';
import { verifyIdToken, checkSitePermission, AuthUser } from '../utils/auth';

const rateLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 10 }); // 10 requests per minute

// Middleware to extract and verify ID token
async function authenticateUser(req: any): Promise<AuthUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  return await verifyIdToken(idToken);
}

// Middleware to check site permission
async function checkPermission(user: AuthUser, siteId: string): Promise<boolean> {
  return await checkSitePermission(user.uid, siteId);
}

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
      // Data collection endpoint - no authentication required for tracking
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

      // Enhance events with UTM and traffic source data
      const enhancedEvents = events.map(event => {
        const enhancedEvent = { ...event };
        
        // Extract UTM parameters from URL if present
        if (event.data.url) {
          const utmParams = extractUTMParameters(event.data.url);
          if (Object.keys(utmParams).length > 0) {
            enhancedEvent.data.trafficSource = {
              ...enhancedEvent.data.trafficSource,
              ...utmParams
            };
          }
        }

        // Extract referrer information
        if (event.data.referrer) {
          const referrerInfo = extractReferrerInfo(event.data.referrer);
          if (Object.keys(referrerInfo).length > 0) {
            enhancedEvent.data.trafficSource = {
              ...enhancedEvent.data.trafficSource,
              ...referrerInfo
            };
          }
        }

        // Add session ID if not present
        if (!enhancedEvent.sessionId) {
          enhancedEvent.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        return enhancedEvent;
      });
      
      await storeRaw(enhancedEvents);
      logInfo(`Processed ${enhancedEvents.length} events`);
      res.status(200).json({ success: true, processed: enhancedEvents.length });
      
    } else if (req.path === '/conversions' || req.path === '/api/conversions') {
      // Get conversions endpoint - requires authentication
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const user = await authenticateUser(req);
      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const siteId = req.query.siteId as string;
      if (!siteId) {
        res.status(400).json({ error: 'siteId parameter is required' });
        return;
      }

      // Check if user has permission to access this site
      const hasPermission = await checkPermission(user, siteId);
      if (!hasPermission) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const conversions = await getConversionsBySiteId(siteId, 100);
      res.status(200).json({ conversions });
      
    } else if (req.path === '/events' || req.path === '/api/events') {
      // Get all events endpoint - requires authentication
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const user = await authenticateUser(req);
      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const siteId = req.query.siteId as string;
      if (!siteId) {
        res.status(400).json({ error: 'siteId parameter is required' });
        return;
      }

      // Check if user has permission to access this site
      const hasPermission = await checkPermission(user, siteId);
      if (!hasPermission) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const events = await getEventsBySiteId(siteId, 100);
      res.status(200).json({ events });
      
    } else if (req.path === '/analytics' || req.path === '/api/analytics') {
      // Get analytics data endpoint - requires authentication
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const user = await authenticateUser(req);
      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const siteId = req.query.siteId as string;
      if (!siteId) {
        res.status(400).json({ error: 'siteId parameter is required' });
        return;
      }

      // Check if user has permission to access this site
      const hasPermission = await checkPermission(user, siteId);
      if (!hasPermission) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Get all events for analytics
      const events = await getEventsBySiteId(siteId, 1000);
      
      // Calculate analytics
      const analytics = {
        totalEvents: events.length,
        totalConversions: events.filter(e => e.type === 'conversion').length,
        totalPageViews: events.filter(e => e.type === 'page_view').length,
        totalCustomEvents: events.filter(e => e.type === 'custom').length,
        trafficSources: {} as Record<string, number>,
        utmSources: {} as Record<string, number>,
        utmMediums: {} as Record<string, number>,
        utmCampaigns: {} as Record<string, number>,
        conversionValue: 0,
        topPages: {} as Record<string, number>,
      };

      events.forEach(event => {
        // Traffic sources
        if (event.data.trafficSource?.referrer_domain) {
          analytics.trafficSources[event.data.trafficSource.referrer_domain] = 
            (analytics.trafficSources[event.data.trafficSource.referrer_domain] || 0) + 1;
        }

        // UTM sources
        if (event.data.trafficSource?.utm_source) {
          analytics.utmSources[event.data.trafficSource.utm_source] = 
            (analytics.utmSources[event.data.trafficSource.utm_source] || 0) + 1;
        }

        // UTM mediums
        if (event.data.trafficSource?.utm_medium) {
          analytics.utmMediums[event.data.trafficSource.utm_medium] = 
            (analytics.utmMediums[event.data.trafficSource.utm_medium] || 0) + 1;
        }

        // UTM campaigns
        if (event.data.trafficSource?.utm_campaign) {
          analytics.utmCampaigns[event.data.trafficSource.utm_campaign] = 
            (analytics.utmCampaigns[event.data.trafficSource.utm_campaign] || 0) + 1;
        }

        // Conversion value
        if (event.type === 'conversion' && event.data.value) {
          analytics.conversionValue += event.data.value;
        }

        // Top pages
        if (event.data.url) {
          analytics.topPages[event.data.url] = (analytics.topPages[event.data.url] || 0) + 1;
        }
      });

      res.status(200).json({ analytics });
      
    } else if (req.path === '/' || req.path === '/api') {
      // Root endpoint - show API info
      res.status(200).json({
        message: 'Conversion Tracker API',
        version: '1.0.0',
        endpoints: {
          collect: {
            method: 'POST',
            path: '/collect',
            description: 'Submit conversion events (no auth required)'
          },
          conversions: {
            method: 'GET',
            path: '/conversions?siteId=YOUR_SITE_ID',
            description: 'Get conversion data for a specific site (auth required)'
          },
          events: {
            method: 'GET',
            path: '/events?siteId=YOUR_SITE_ID',
            description: 'Get all events for a specific site (auth required)'
          },
          analytics: {
            method: 'GET',
            path: '/analytics?siteId=YOUR_SITE_ID',
            description: 'Get analytics data for a specific site (auth required)'
          }
        },
        authentication: {
          required: 'For protected endpoints, include Authorization header with Firebase ID token',
          format: 'Authorization: Bearer YOUR_ID_TOKEN'
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