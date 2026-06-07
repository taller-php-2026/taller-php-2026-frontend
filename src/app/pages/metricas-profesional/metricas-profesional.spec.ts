import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricasProfesional } from './metricas-profesional';

describe('MetricasProfesional', () => {
  let component: MetricasProfesional;
  let fixture: ComponentFixture<MetricasProfesional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricasProfesional],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricasProfesional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
