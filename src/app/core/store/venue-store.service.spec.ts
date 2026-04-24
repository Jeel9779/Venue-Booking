import { TestBed } from '@angular/core/testing';

import { VenueStoreService } from './venue-store.service';

describe('VenueStoreService', () => {
  let service: VenueStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenueStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
