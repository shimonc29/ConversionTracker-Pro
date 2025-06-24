import { EventEmitter } from 'events';
import { TrackingEvent, ConversionEvent, EventType } from '../types';
import { SessionManager } from './SessionManager';
import { AttributionManager } from './AttributionManager';
import { NetworkManager } from './NetworkManager';
import { StorageManager } from './StorageManager';

interface Config {
  siteId: string;
  version: string;
}

export class ConversionTracker extends EventEmitter {
  private config: Config;
  private sessionManager: SessionManager;
  private attributionManager: AttributionManager;
  private networkManager: NetworkManager;
  private storageManager: StorageManager;
  private initialized = false;

  constructor(config: Config) {
    super();
    this.config = { ...this.getDefaultConfig(), ...config };
    this.sessionManager = new SessionManager();
    this.attributionManager = new AttributionManager();
    this.networkManager = new NetworkManager();
    this.storageManager = new StorageManager();
  }

  private getDefaultConfig(): Config {
    return {
      siteId: '',
      version: '1.0.0',
    };
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      await Promise.all([
        this.sessionManager.init(),
        this.attributionManager.init(),
        this.networkManager.init(),
        this.storageManager.init(),
      ]);
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  track(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.initialized) {
      this.emit('error', new Error('Tracker not initialized'));
      return;
    }
    const event: TrackingEvent = {
      eventId: this.generateEventId(),
      siteId: this.config.siteId,
      type: 'custom',
      data: {
        eventName,
        properties,
        url: typeof window !== 'undefined' ? window.location.href : '',
        title: typeof document !== 'undefined' ? document.title : '',
        timestamp: new Date().toISOString(),
        session: this.sessionManager.getCurrentSession(),
        attribution: this.attributionManager.getCurrentAttribution(),
      },
      timestamp: new Date().toISOString(),
      version: this.config.version,
    };
    this.networkManager.sendEvent(event);
  }

  conversion(conversionType: string, data: Partial<Omit<ConversionEvent['data'], 'session' | 'url' | 'timestamp'>> = {}): void {
    if (!this.initialized) {
      this.emit('error', new Error('Tracker not initialized'));
      return;
    }
    const conversionEvent: ConversionEvent = {
      eventId: this.generateEventId(),
      siteId: this.config.siteId,
      type: 'conversion',
      data: {
        conversionType,
        ...data,
        attribution: this.attributionManager.getFullAttribution(),
      },
      timestamp: new Date().toISOString(),
      version: this.config.version,
    };
    this.networkManager.sendEvent(conversionEvent, { priority: 'high' });
    this.emit('conversion', conversionEvent);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 