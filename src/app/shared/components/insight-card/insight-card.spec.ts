import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsightCard } from '@shared/components/insight-card/insight-card';

describe('InsightCard', () => {
  let component: InsightCard;
  let fixture: ComponentFixture<InsightCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsightCard],
    }).compileComponents();

    fixture = TestBed.createComponent(InsightCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
