import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtracurricularPage } from './extracurricular.page';

describe('ExtracurricularPage', () => {
  let component: ExtracurricularPage;
  let fixture: ComponentFixture<ExtracurricularPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtracurricularPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
