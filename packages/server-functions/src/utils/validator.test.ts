/* eslint-env jest */
import { validateEvent, validateBatch } from './validator';

describe('Event Validator', () => {
  it('should validate a correct event', () => {
    const event = {
      eventId: 'evt1',
      siteId: 'site1',
      type: 'custom',
      data: {},
      clientTimestamp: new Date().toISOString(),
    };
    const result = validateEvent(event);
    expect(result.success).toBe(true);
  });

  it('should reject an invalid event', () => {
    const event = { foo: 'bar' };
    const result = validateEvent(event);
    expect(result.success).toBe(false);
  });

  it('should validate a batch of events', () => {
    const events = [
      {
        eventId: 'evt1',
        siteId: 'site1',
        type: 'custom',
        data: {},
        clientTimestamp: new Date().toISOString(),
      },
      { foo: 'bar' },
    ];
    const valid = validateBatch(events);
    expect(valid.length).toBe(1);
    expect(valid[0].eventId).toBe('evt1');
  });
});
