import { Component, inject, OnDestroy } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { PhotoService } from '../../../../helpers/services/services/photo.service';

@Component({
  selector: 'app-upload-photos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-photos.component.html',
  styleUrl: './upload-photos.component.scss'
})
export class UploadPhotosComponent implements OnDestroy{
  // Injectors
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);
  expeditionService = inject(ExpeditionService);
  photoService = inject(PhotoService);

  // Variables
  destroy$:Subject<any> = new Subject();
  currentUser:any;
  currentProject:any;
  entity:any;
  selectedExp:any;
  expeditions:Array<any> = [];
  photoEntities:Array<any> = [];
  loading: boolean = false;
  file: any;
  expeditionCode: any;
  uploadProgress: any;
  canResume: any;

  constructor(){
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(!res) return;
      this.currentProject = res;
      this.setPhotoEntities();
      this.getUserExpeditions();
    });
  }

  setPhotoEntities() {
    const { entities } = this.currentProject.config;
    this.photoEntities = entities
      .filter((e:any) => e.type === 'Photo')
      .map((e:any) => {
        const parentEntity = entities.find(
          (p:any) => p.conceptAlias === e.parentEntity,
        );

        const excludeCols = ['originalUrl', 'photoID', parentEntity.uniqueKey];

        return {
          conceptAlias: e.conceptAlias,
          parentEntity: e.parentEntity,
          generateID: e.generateID,
          additionalMetadata: e.attributes.filter(
            (a:any) => !a.internal && !excludeCols.includes(a.column),
          ),
          requiresExpedition: !parentEntity.uniqueAcrossProject,
        };
      });
    if (this.photoEntities.length === 1) this.entity = this.photoEntities[0].conceptAlias;
  }

  getUserExpeditions(){
    this.expeditionService.getAllExpeditions(this.currentProject.projectId).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next:(res:any)=>{
        if(res){
          this.expeditions = res.filter((item:any)=> this.currentUser.email == item.user.email);
        }
      },
      error:(err:any)=>{}
    })
  }

  async upload() {
    if (
      !this.file ||
      !this.entity ||
      (this.entity.requiresExpedition && !this.expeditionCode)
    ) {
      return;
    }

    if (
      this.currentProject.enforceExpeditionAccess &&
      this.currentProject.user.userId !== this.currentUser.userId
    ) {
      console.warn('========dhow dialog to user===');
      
      // try {
      //   await this.$mdDialog.show(
      //     this.$mdDialog
      //       .confirm()
      //       .title('Upload Warning!')
      //       .htmlContent(
      //         `<p><strong>Do you own the expeditions you are uploading photos for?</strong></p>
      //         <p>You can only only upload photos for data in expeditions that you own. If you do not own the expedition(s) that contain the ${
      //           this.entity.parentEntity
      //         }s you are uploading photos for, the upload will fail only after the file is completely uploaded.</p>
      //         <p><strong>Would you like to continue?</strong></p>`,
      //       )
      //       .ok('Continue')
      //       .cancel('Cancel'),
      //   );
      // } catch (e) {
      //   return;
      // }
    }

    this.uploadProgress = 0;
    this.loading = true;

    const resume = !!this.canResume;
    this.canResume = false;

    this.photoService.upload(
      this.currentProject.projectId,
      this.expeditionCode,
      this.entity.conceptAlias,
      this.file,
      resume,
      this.ignoreId
    )
    // .progress((event:any) => {
      //   this.uploadProgress = parseInt(String((100.0 * event.loaded) / event.total));
      // })
    .subscribe({
      next: (res:any) => {
        console.log('====res===',res);
        // this.showResultDialog(res);
      },
      complete: () => {
        if (!this.canResume) {
          this.uploadProgress = undefined;
        }
        this.loading = false;
      }
    })
  }
  ignoreId(projectId: any, expeditionCode: any, conceptAlias: any, file: any, resume: boolean, ignoreId: any) {
    throw new Error('Method not implemented.');
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
