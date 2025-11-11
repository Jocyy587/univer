import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cat19Page } from './cat19.page';

describe('Cat19Page', () => {
  let component: Cat19Page;
  let fixture: ComponentFixture<Cat19Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Cat19Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
