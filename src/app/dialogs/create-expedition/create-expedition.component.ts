import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, Subject, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../helpers/services/expedition.service';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-expedition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-expedition.component.html',
  styleUrl: './create-expedition.component.scss'
})
export class CreateExpeditionComponent implements OnDestroy{
  // Injectors
  private fb = inject(FormBuilder);
  public activeModal = inject(NgbActiveModal);
  private toastrService = inject(ToastrService);
  private expService = inject(ExpeditionService);

  // Variables
  @Input() public currentProject: any;
  destroy$: Subject<any> = new Subject();
  expeditionForm!: FormGroup;
  codeRegex: any = /^[a-zA-Z0-9_]{4,50}$/;
  isLoading: boolean = false;
  codeExists: boolean = true;
  metaDataList: any[] = [];

  constructor() {
    this.initForm()
    setTimeout(() => {
      this.metaDataList = this.currentProject.config.expeditionMetadataProperties;
      this.metaDataList.forEach((item:any) => this.addControl(item.name, item.required));
    }, 100);
  }

  get form() {
    return this.expeditionForm.controls;
  }

  initForm() {
    this.expeditionForm = this.fb.group({
      expeditionCode: ['', [Validators.required, Validators.pattern(this.codeRegex)]],
      expeditionTitle: ['', [Validators.required]],
      public: [true],
      visibility: ['anyone']
    })
    this.form['expeditionCode'].valueChanges.pipe(debounceTime(500), takeUntil(this.destroy$)).subscribe((res: any) => this.validateCode(res));
  }

  validateCode(code: string) {
    const newCode = code.trim();
    if (newCode && newCode.length >= 4 && !this.form['expeditionCode'].errors) {
      this.expService.getExpeditionByCode(this.currentProject.projectId, newCode).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res) this.codeExists = true
          else this.codeExists = false;
        }
      })
    }
  }

  createNew() {
    this.expeditionForm.markAllAsTouched();
    if (this.expeditionForm.invalid || this.codeExists) return;
    
    this.isLoading = true;
    const payload = this.formatData();
    this.expService.createExpedition(this.currentProject.projectId, payload)
      .pipe(take(1), takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res) {
            this.toastrService.success('Expedition Created.');
            this.activeModal.close(this.form['expeditionTitle'].value);
          }
        },
        error: (err: any) => this.isLoading = false
      })
  }

  formatData():any{
    const data:any = { ...this.expeditionForm.value, metadata: {} };
    this.metaDataList.forEach(item => {
      if(data[item.name]) data.metadata[item.name] = data[item.name];
      delete data[item.name];
    })
    return data;
  }

  addControl(control:string, required:boolean){
    this.expeditionForm.addControl(control, this.fb.control('', required ? Validators.required : []));
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
