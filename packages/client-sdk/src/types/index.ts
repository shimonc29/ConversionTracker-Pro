export type EventType = 'page_view' | 'custom' | 'conversion';

export interface TrackingEvent {
  eventId: string;
  siteId: string;
  type: EventType;
  data: Record<string, any>;
  timestamp: string;
  version: string;
}

export interface ConversionEvent extends TrackingEvent {
  type: 'conversion';
  data: {
    conversionType: string;
    value?: number;
    currency?: string;
    orderId?: string;
    attribution: AttributionData;
  };
}

export interface AttributionData {
  firstTouch: TouchPoint;
  lastTouch: TouchPoint;
  currentTouch: TouchPoint;
  fullPath: TouchPoint[];
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