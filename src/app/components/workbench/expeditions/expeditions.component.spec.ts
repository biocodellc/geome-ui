import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { ExpeditionsComponent } from './expeditions.component';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { ProjectAccessService } from '../../../../helpers/services/project-access.service';
import { accessFor, expedition, member, ProjectAccessStub } from '../../../../helpers/testing/project-access.fixture';

describe('ExpeditionsComponent member browsing', () => {
  let access: ProjectAccessStub;
  let expeditions: jasmine.SpyObj<ExpeditionService>;
  beforeEach(async () => {
    access = new ProjectAccessStub();
    expeditions = jasmine.createSpyObj('ExpeditionService', ['getAccessibleExpeditionOverview']);
    expeditions.getAccessibleExpeditionOverview.and.returnValue(of({ items: Array.from({ length: 38 }, (_, i) => ({ ...expedition, expeditionId: i + 1 })), statisticsLoading: false, statisticsError: '' }));
    await TestBed.configureTestingModule({ imports: [ExpeditionsComponent], providers: [
      provideRouter([]), { provide: ProjectAccessService, useValue: access },
      { provide: ExpeditionService, useValue: expeditions }, { provide: NgbModal, useValue: {} }
    ] }).compileComponents();
  });

  it('shows all 38 accessible expeditions, with ownership as an optional filter', () => {
    const fixture = TestBed.createComponent(ExpeditionsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.visibleExpeditions.length).toBe(38);
    component.myExpeditionsOnly = true;
    expect(component.visibleExpeditions.length).toBe(0);
    component.projectExpeditions.push({ ...expedition, user: { ...member, userId: '7' } });
    expect(component.visibleExpeditions.length).toBe(1);
  });

  it('renders an explanation and retry action when loading fails', () => {
    expeditions.getAccessibleExpeditionOverview.and.returnValue(throwError(() => ({ status: 500 })));
    const fixture = TestBed.createComponent(ExpeditionsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Unable to load expeditions');
    expect(fixture.componentInstance.isLoading).toBeFalse();
  });
});
