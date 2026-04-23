import { TestBed } from '@angular/core/testing';

import { VenueService } from '@core/services/venue.service';

describe('VenueService', () => {
  let service: VenueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
