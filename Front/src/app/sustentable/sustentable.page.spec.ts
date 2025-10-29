import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SustentablePage } from './sustentable.page';

describe('SustentablePage', () => {
  let component: SustentablePage;
  let fixture: ComponentFixture<SustentablePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SustentablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
