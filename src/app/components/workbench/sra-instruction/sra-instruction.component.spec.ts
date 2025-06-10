import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SraInstructionComponent } from './sra-instruction.component';

describe('SraInstructionComponent', () => {
  let component: SraInstructionComponent;
  let fixture: ComponentFixture<SraInstructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SraInstructionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SraInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
