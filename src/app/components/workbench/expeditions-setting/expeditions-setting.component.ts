import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbModal, NgbModalRef, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { catchError, combineLatest, finalize, map, of, startWith, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { ProjectAccessService, sameUserId } from '../../../../helpers/services/project-access.service';

@Component({
  selector: 'app-expeditions-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgbNavModule],
  templateUrl: './expeditions-setting.component.html',
  styleUrl: './expeditions-setting.component.scss'
})
export class ExpeditionsSettingComponent implements OnDestroy {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private modalService = inject(NgbModal);
  private toastrService = inject(ToastrService);
  private activatedRoute = inject(ActivatedRoute);
  private expeditionService = inject(ExpeditionService);
  accessService = inject(ProjectAccessService);
  private destroy$ = new Subject<void>();
  private loadedKey = '';
  private writeDenied = false;
  activeTab = 'settings';
  currentUser: any;
  currentProject: any;
  currentExpedition: any;
  currentExpeditionId = '';
  expeditionForm!: FormGroup;
  modalRef?: NgbModalRef;
  metaDataList: any[] = [];
  isLoading = true;
  isSaving = false;
  loadError = '';
  saveError = '';
  isExpeditionOwner = false;
  isProjectOwner = false;
  canEditExpeditionSettings = false;

  constructor() {
    this.initForm();
    combineLatest([this.accessService.context$, this.activatedRoute.params]).pipe(
      switchMap(([access, params]) => {
        this.currentUser = access.user;
        this.currentProject = access.project;
        this.currentExpeditionId = params['id'];
        this.canEditExpeditionSettings = false;
        this.expeditionForm.disable({ emitEvent: false });
        if (access.loading || access.error) return of({ items: [], loading: access.loading, error: access.error });
        return this.expeditionService.getAccessibleExpeditions(access).pipe(
          map(items => ({ items, loading: false, error: '' })),
          catchError(error => of({ items: [], loading: false, error: error.status === 403
            ? 'Your account does not have permission to view this expedition. Please contact the project owner.'
            : 'Unable to load expedition details. Please retry. Any unsaved draft is retained on this page.' })),
          startWith({ items: [], loading: true, error: '' })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.isLoading = state.loading;
      this.loadError = state.error;
      if (state.loading || state.error) return;
      const expedition = state.items.find(item => String(item.expeditionId) === String(this.currentExpeditionId));
      if (!expedition) {
        this.loadError = 'This expedition was not found among the expeditions available to your account. Please contact the project owner if you need access.';
        return;
      }
      const key = `${this.currentUser.userId}/${this.currentProject.projectId}/${this.currentExpeditionId}`;
      const keepDraft = key === this.loadedKey && this.expeditionForm.dirty;
      this.currentExpedition = expedition;
      if (!keepDraft) {
        this.initForm();
        this.metaDataList = this.currentProject.config?.expeditionMetadataProperties || [];
        this.metaDataList.forEach(item => this.expeditionForm.addControl(item.name, this.fb.control('', item.required ? Validators.required : [])));
        const values: any = { expeditionTitle: expedition.expeditionTitle, visibility: expedition.visibility };
        this.metaDataList.forEach(item => values[item.name] = expedition.metadata?.[item.name] ?? '');
        this.expeditionForm.patchValue(values);
        this.saveError = '';
      }
      this.loadedKey = key;
      this.writeDenied = false;
      this.refreshSettingsPermission();
    });
  }

  initForm(): void {
    this.expeditionForm = this.fb.group({ expeditionTitle: ['', Validators.required], visibility: ['', Validators.required] });
    this.expeditionForm.disable({ emitEvent: false });
  }

  get form() { return this.expeditionForm.controls; }
  get expeditionOwnerName(): string { return this.currentExpedition?.user?.username || 'the expedition owner'; }
  get expeditionAccessEnabled(): boolean { return this.currentProject?.enforceExpeditionAccess === true || this.currentProject?.enforceExpeditionAccess === 'true'; }

  refreshSettingsPermission(): boolean {
    const access = this.accessService.current;
    const key = `${access.user?.userId}/${access.project?.projectId}/${this.currentExpeditionId}`;
    const ready = !this.isLoading && !this.loadError && !access.loading && !access.error && access.isMember && key === this.loadedKey;
    this.isExpeditionOwner = ready && sameUserId(access.user, this.currentExpedition?.user);
    this.isProjectOwner = ready && sameUserId(access.user, access.project?.user);
    this.canEditExpeditionSettings = !this.writeDenied && (this.isExpeditionOwner || this.isProjectOwner);
    if (this.canEditExpeditionSettings) this.expeditionForm.enable({ emitEvent: false });
    else this.expeditionForm.disable({ emitEvent: false });
    return this.canEditExpeditionSettings;
  }

  updateExpedition(): void {
    if (this.isSaving) return;
    // Evaluate current identities again; upload access settings never grant settings-edit permission.
    if (!this.refreshSettingsPermission()) {
      this.saveError = `You cannot save these settings. Please contact ${this.expeditionOwnerName} or the project owner. Any unsaved draft is retained on this page.`;
      return;
    }
    this.expeditionForm.markAllAsTouched();
    if (this.expeditionForm.invalid) return;
    this.isSaving = true;
    this.saveError = '';
    const data = { ...this.expeditionForm.getRawValue() };
    const metadata = { ...this.currentExpedition.metadata };
    this.metaDataList.forEach(item => { metadata[item.name] = data[item.name]; delete data[item.name]; });
    const updatedData = { ...this.currentExpedition, ...data, metadata };
    this.expeditionService.updateExpedition(this.currentProject.projectId, updatedData).pipe(
      take(1), takeUntil(this.destroy$), finalize(() => this.isSaving = false)
    ).subscribe({
      next: response => {
        if (!response) { this.saveError = 'The server did not confirm the update. Your draft is retained on this page.'; return; }
        this.currentExpedition = response;
        this.expeditionForm.markAsPristine();
        this.refreshSettingsPermission();
        this.toastrService.success('Updated Successfully.');
      },
      error: error => this.handleWriteError(error, 'save')
    });
  }

  openDeleteModal(content: TemplateRef<any>): void {
    if (!this.refreshSettingsPermission() || this.isSaving) return;
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  deleteExpedition(): void {
    if (this.isSaving || !this.refreshSettingsPermission()) return;
    this.isSaving = true;
    this.saveError = '';
    this.expeditionService.deleteExpedition(this.currentProject.projectId, this.currentExpedition).pipe(
      take(1), takeUntil(this.destroy$), finalize(() => this.isSaving = false)
    ).subscribe({
      next: response => {
        if (!response) { this.saveError = 'The server did not confirm deletion.'; return; }
        this.toastrService.success('Expedition Deleted!');
        this.modalRef?.close();
        this.router.navigate(['/workbench', 'expeditions']);
      },
      error: error => { this.modalRef?.close(); this.handleWriteError(error, 'delete'); }
    });
  }

  private handleWriteError(error: any, operation: string): void {
    if (error.status === 403) {
      this.writeDenied = true;
      this.refreshSettingsPermission();
      this.saveError = `The server denied permission to ${operation} this expedition. Please contact ${this.expeditionOwnerName} or the project owner to save settings changes. Your draft is retained on this page.`;
    } else {
      this.saveError = `Unable to ${operation} the expedition. Your draft is retained on this page. Please retry.`;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
