import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProjectConfigurationService } from '../../../../helpers/services/project-config.service';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../../../helpers/services/project.service';

@Component({
  selector: 'app-project-configuration',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './project-configuration.component.html',
  styleUrl: './project-configuration.component.scss'
})
export class ProjectConfigurationComponent {
  // Injectors
  toastrService = inject(ToastrService);
  projectService = inject(ProjectService);
  dummyDataService = inject(DummyDataService);
  projConfigService = inject(ProjectConfigurationService);

  destroy$:Subject<void> = new Subject();
  currentProject:any;

  constructor(){
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
}
