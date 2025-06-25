import { onRequest } from 'firebase-functions/v2/https';

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

export const getConversions = onRequest((req, res) => {
  res.status(200).json({ conversions: mockConversions });
});
