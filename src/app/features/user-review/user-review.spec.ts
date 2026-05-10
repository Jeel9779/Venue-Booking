import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReview } from './user-review';

describe('UserReview', () => {
  let component: UserReview;
  let fixture: ComponentFixture<UserReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserReview],
    }).compileComponents();

    fixture = TestBed.createComponent(UserReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
