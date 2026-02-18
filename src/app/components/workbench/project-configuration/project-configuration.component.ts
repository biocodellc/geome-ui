import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProjectConfigurationService } from '../../../../helpers/services/project-config.service';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../../../helpers/services/project.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';

@Component({
  selector: 'app-project-configuration',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './project-configuration.component.html',
  styleUrl: './project-configuration.component.scss'
})
export class ProjectConfigurationComponent implements OnDestroy {
  // Injectors
  toastrService = inject(ToastrService);
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);
  dummyDataService = inject(DummyDataService);
  projConfigService = inject(ProjectConfigurationService);

  destroy$:Subject<void> = new Subject();
  currentProject:any;
  currentUser:any;

  constructor(){
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((x:any) => this.currentUser = x);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((x:any) => this.currentProject = x);
  }

  saveConfigs(){
    this.dummyDataService.loadingState.next(true);
    this.projConfigService.save(this.projConfigService.getUpdatedCurrentProjVal()).pipe(take(1)).subscribe((res:any) => {
      if(res){
        this.projectService.setCurrentProject(this.currentProject, false);
        this.projConfigService.setInitialProjVal(res);
        this.toastrService.success('Configs Updated!');
        this.dummyDataService.loadingState.next(false);
      }
    })
  }

  get changesDetected():boolean{
    return this.projConfigService.isConfigChanges;
  }

  get canEditConfiguration(): boolean {
    const currentUserId = Number(this.currentUser?.userId);
    if (!currentUserId) return false;
    if (currentUserId === 1) return true;
    const teamOwnerId = Number(this.currentProject?.projectConfiguration?.user?.userId);
    return !!teamOwnerId && currentUserId === teamOwnerId;
  }

  get teamOwnerName(): string {
    const owner = this.currentProject?.projectConfiguration?.user || {};
    const firstName = owner.firstName || '';
    const lastName = owner.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || owner.name || owner.username || owner.email || 'the team owner';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
