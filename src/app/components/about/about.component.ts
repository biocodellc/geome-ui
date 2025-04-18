import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
// import { ActivatedRoute, RouterLink } from '@angular/router';
// import { NgbAccordionModule, NgbAccordionDirective } from '@ng-bootstrap/ng-bootstrap';
// import { DummyDataService } from '../../../helpers/services/dummy-data.service';
// import { filter, Subject, take, takeUntil } from 'rxjs';
// import { ProjectConfigurationService } from '../../../helpers/services/project-config.service';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  // Injectables
  sanitizer = inject(DomSanitizer);
  // dataService = inject(DummyDataService);
  // activatedRoute = inject(ActivatedRoute);
  // projectConfService = inject(ProjectConfigurationService);

  // Variables
  docUrl:SafeResourceUrl = '';
  // destroy$: Subject<void> = new Subject();
  // @ViewChild(NgbAccordionDirective) accordion!: NgbAccordionDirective;
  // fragment: string = '';
  // firstSection: Array<any> = this.dataService.getAboutFirstSectionData();
  // teams: Array<any> = [];

  constructor() {
    this.docUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.documentationUrl);

    // this.activatedRoute.fragment.pipe(take(1)).subscribe((fragment: any) => this.fragment = fragment);
    // this.getAllPublicTeams();
  }

  // ngAfterViewInit(): void {
  //   if (!this.fragment) return;
  //   document.querySelector(`#${this.fragment}-toggle`)?.scrollIntoView();
  //   this.accordion.toggle(this.fragment);
  // }

  // getAllPublicTeams() {
  //   this.projectConfService.allProjConfigSubject.pipe(
  //     takeUntil(this.destroy$),
  //     filter((team: any) => team.networkApproved)
  //   ).subscribe((res: any) => {
  //     this.teams = res;
  //   })
  // }

  // ngOnDestroy(): void {
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }
}
