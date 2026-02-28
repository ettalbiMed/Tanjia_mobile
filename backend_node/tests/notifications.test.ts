import { describe, expect, it } from 'vitest';
import { getStatusMessage } from '../src/modules/notifications/service.js';

describe('status notifications', () => {
  it('returns business message for preparing status', () => {
    expect(getStatusMessage('PREPARING')).toContain('préparation');
  });
});
