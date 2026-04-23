import { TestBed } from '@angular/core/testing';

import { PlanService } from '@core/services/plan.service';

describe('PlanService', () => {
  let service: PlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
