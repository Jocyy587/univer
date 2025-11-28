import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignacionesPage } from './asignaciones.page';

describe('AsignacionesPage', () => {
  let component: AsignacionesPage;
  let fixture: ComponentFixture<AsignacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
