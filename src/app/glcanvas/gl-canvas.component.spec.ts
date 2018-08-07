import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlCanvasComponent } from './gl-canvas.component';

describe('GlCanvasComponent', () => {
  let component: GlCanvasComponent;
  let fixture: ComponentFixture<GlCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
