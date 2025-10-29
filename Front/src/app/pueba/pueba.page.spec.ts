import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PuebaPage } from './pueba.page';

describe('PuebaPage', () => {
  let component: PuebaPage;
  let fixture: ComponentFixture<PuebaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PuebaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
