import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorSubscriptions } from './vendor-subscriptions';

describe('VendorSubscriptions', () => {
  let component: VendorSubscriptions;
  let fixture: ComponentFixture<VendorSubscriptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorSubscriptions],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorSubscriptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
