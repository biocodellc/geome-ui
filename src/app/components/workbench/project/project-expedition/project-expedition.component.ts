import { readSortPreference, sortRows, SortPreference } from '../../../../../helpers/scripts/list-sorting';
import { ListSortComponent } from '../../../../shared/list-sort/list-sort.component';
import { LatestActivityComponent } from '../../../../shared/latest-activity/latest-activity.component';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ProjectAccessService, sameUserId } from '../../../../../helpers/services/project-access.service';
import { ExpeditionService } from '../../../../../helpers/services/expedition.service';
import { ToastrService } from 'ngx-toastr';
import { FileService } from '../../../../../helpers/services/file.service';
import { DataService } from '../../../../../helpers/services/data.service';
import { DeleteModalComponent } from '../../../../dialogs/delete-modal/delete-modal.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-project-expedition',
  standalone: true,
  imports: [ListSortComponent, LatestActivityComponent, CommonModule, RouterLink],
  templateUrl: './project-expedition.component.html',
  styleUrl: './project-expedition.component.scss'
})
export class ProjectExpeditionComponent implements OnDestroy {
  // Injectors
  toastr = inject(ToastrService);
  modalService = inject(NgbModal);
  fileService = inject(FileService);
  dataService = inject(DataService);
  expService = inject(ExpeditionService);
  accessService = inject(ProjectAccessService);

  // Variables
  destroy$:Subject<any> = new Subject();
  sort = readSortPreference('expeditions');
  statisticsError = '';
  get sortedExpeditions(): any[] { return sortRows(this.allExpeditions, this.sort); }
  currentProject:any;
  allExpeditions:Array<any> = [];
  modalRef!: NgbModalRef;
  isLoading = true;
  loadError = '';
  actionError = '';

  constructor(){
    this.accessService.context$.pipe(
      switchMap(access => {
        this.statisticsError = '';
        this.currentProject = access.project;
        if (access.loading || access.error) return of({ items: [], loading: access.loading, error: access.error });
        return this.expService.getAccessibleExpeditionOverview(access).pipe(
          map(result => { this.statisticsError = result.statisticsError; return { items: result.items, loading: false, error: '' }; }),
          catchError(error => of({ items: [], loading: false, error: error.status === 403
            ? 'Your account does not have permission to view these expeditions. Please contact the project owner.'
            : 'Unable to load expeditions. Please retry.' })),
          startWith({ items: [], loading: true, error: '' })
        );
      }), takeUntil(this.destroy$)
    ).subscribe(state => {
      this.allExpeditions = state.items;
      this.isLoading = state.loading;
      this.loadError = state.error;
    });
  }

  canEditSettings(expedition: any): boolean {
    const access = this.accessService.current;
    return !this.isLoading && !this.loadError && !access.loading && !access.error && access.isMember &&
      (sameUserId(access.user, expedition?.user) || sameUserId(access.user, access.project?.user));
  }

  deleteExp(data:any){
    const currentExpedition = this.allExpeditions.find(item => String(item.expeditionId) === String(data.expeditionId));
    if (!currentExpedition || !this.canEditSettings(currentExpedition)) { this.actionError = 'Only the expedition owner or project owner can delete this expedition.'; return; }
    this.expService.deleteExpedition(this.currentProject.projectId, data)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: response => { if (response) { this.toastr.success('Expedition deleted!'); this.accessService.retry(); } },
      error: error => this.actionError = error.status === 403
        ? 'The server denied permission to delete this expedition. Please contact the project owner.'
        : 'Unable to delete the expedition. Please retry.'
    });
  }

  exportExpedtionData(expCode:string){
    this.dataService.exportData(this.currentProject.projectId, expCode).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res.status === 204) this.toastr.warning('No resources found')
      else if(res.url){
        this.fileService.download(res.url);
        this.toastr.success('Downloading Data!');
      }
    })
  }

  openModal(expData:any) {
    if (!this.canEditSettings(expData)) return;
    this.modalRef = this.modalService.open(DeleteModalComponent, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false })
    this.modalRef.componentInstance.modalFor = 'Expedition';
    this.modalRef.dismissed.subscribe((res: any) => {
      if (res) this.deleteExp(expData);
    })
  }

  ngOnDestroy(): void { this.destroy$.next(''); this.destroy$.complete(); }
}
