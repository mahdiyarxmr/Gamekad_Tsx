import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventsService } from './events.service';

describe('payable', () => {
  const s = Object.create(EventsService.prototype) as EventsService;
  it('uses discount then online then price', () => {
    assert.equal(s.payable({ discountPrice: 100, onlineAmount: 200, price: 300, payType: 'full' }, 2), 200);
    assert.equal(s.payable({ discountPrice: 0, onlineAmount: 0, price: 180000, payType: 'full' }, 1), 180000);
  });
  it('venue pay is zero online', () => {
    assert.equal(s.payable({ discountPrice: 0, onlineAmount: 0, price: 180000, payType: 'venue' }, 1), 0);
  });
});
