import { TestBed } from '@angular/core/testing';

import { VendorSubscriptionServices } from './vendor-subscription.services';

describe('VendorSubscriptionServices', () => {
  let service: VendorSubscriptionServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendorSubscriptionServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
