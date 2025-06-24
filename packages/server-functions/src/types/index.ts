export interface RawEvent {
  eventId: string;
  siteId: string;
  type: string;
  data: Record<string, any>;
  clientTimestamp: string;
  serverTimestamp?: string;
  userAgent?: string;
  ipHash?: string;
}

export interface ProcessedConversion {
  conversionId: string;
  siteId: string;
  userId: string;
  sessionId?: string;
  conversionType: string;
  value?: number;
  currency?: string;
  timestamp: string;
  attributedSource: string;
  attributionModel: string;
  confidence: number;
  touchpointCount: number;
  attributionPath: TouchPoint[];
}

export interface TouchPoint {
  source: string;
  medium: string;
  campaign?: string;
  timestamp: string;
  url: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
} 