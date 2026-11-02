import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { ProjectAccessService, sameUserId } from '../../../../helpers/services/project-access.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateExpeditionComponent } from '../../../dialogs/create-expedition/create-expedition.component';

@Component({
  selector: 'app-expeditions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './expeditions.component.html',
  styleUrl: './expeditions.component.scss'
})
export class ExpeditionsComponent implements OnDestroy {
  private modalService = inject(NgbModal);
  private expeditionService = inject(ExpeditionService);
  accessService = inject(ProjectAccessService);
  private destroy$ = new Subject<void>();
  currentUser: any;
  currentProject: any;
  isLoading = true;
  isMember = false;
  loadError = '';
  myExpeditionsOnly = false;
  projectExpeditions: any[] = [];

  constructor() {
    this.accessService.context$.pipe(
      switchMap(access => {
        this.currentUser = access.user;
        this.currentProject = access.project;
        this.isMember = access.isMember;
        if (access.loading || access.error) return of({ items: [], loading: access.loading, error: access.error });
        return this.expeditionService.getAccessibleExpeditions(access).pipe(
          map(items => ({ items, loading: false, error: '' })),
          catchError(error => of({ items: [], loading: false, error: error.status === 403
            ? 'Your account does not have permission to view these expeditions. Please contact the project owner.'
            : 'Unable to load expeditions. Please retry.' })),
          startWith({ items: [], loading: true, error: '' })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.projectExpeditions = state.items;
      this.isLoading = state.loading;
      this.loadError = state.error;
    });
  }

  get visibleExpeditions(): any[] {
    return this.myExpeditionsOnly
      ? this.projectExpeditions.filter(item => sameUserId(this.currentUser, item.user))
      : this.projectExpeditions;
  }

  openCreateModal(): void {
    if (!this.isMember || this.isLoading || this.loadError) return;
    const modal = this.modalService.open(CreateExpeditionComponent, { animation: true, centered: true, backdrop: false });
    modal.componentInstance.currentProject = { ...this.currentProject };
    modal.result.then(result => { if (result) this.accessService.retry(); }, () => {});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
