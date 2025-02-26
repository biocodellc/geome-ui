import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, take } from 'rxjs';
// import { ProjectConfigurationService } from './project-configuration.service';
// import { ProjectConfige } from '../models/ProjectConfig';
import { ProjectConfigurationService } from './project-config.service';
import { ProjectConfig } from '../models/projectConfig.model';
import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';

export const PROJECT_CHANGED_EVENT = 'projectChanged';

export interface Project {
  projectId: string;
  config?: any;
  limitedAccess?: boolean;
  title?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = environment.restRoot;
  private currentProject: Project | null = null;
  private projectSubject = new BehaviorSubject<Project | null>(null);
  private allProjectSubject = new BehaviorSubject<Project[] | null>(null);
  private allProjectStatsSubject = new BehaviorSubject<any>(null);
  userProjectSubject = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
  ) {}

  currentProject$(): Observable<Project | null> {
    return this.projectSubject.asObservable();
  }

  getAllProjectsValue():Observable<any>{
    return this.allProjectSubject.asObservable();
  }

  allProjectsStats():Observable<any>{
    return this.allProjectStatsSubject.asObservable();
  }

  setCurrentProject(project: any, redirect = true): void {
    if (!project?.projectId) {
      this.currentProject = null;
      this.projectSubject.next(null);
      this.router.navigate(['/workbench/dashboard']);
      return;
    }
    else if(project.config){
      this.currentProject = project;
      this.projectSubject.next(project);
      this.cacheProject(project.projectId);
      if(redirect) this.router.navigate(['/workbench/project-overview']);
    }
    else{
      const projectData = this.getProjectFromLocal(project.projectId) || project;
      this.getProjectConfig(projectData.projectId).pipe(take(1)).subscribe({
        next: (res:any) => {
          const updatedProject = { ...projectData ,config : new ProjectConfig(res) };
          this.currentProject = updatedProject;
          this.projectSubject.next(updatedProject);
          this.cacheProject(updatedProject.projectId);
          if(redirect) this.router.navigate(['/workbench/project-overview']);
        }
      })
    }
  }

  getProjectFromLocal(projectId:number){
    const allPublicProj = this.allProjectSubject.value || [];
    return allPublicProj.filter((proj:any) => proj.projectId == projectId)[0];
  }

  cacheProject(projectId: string): void {
    this.authService.apendUserVal('projectId', projectId);
  }

  getProject(projectId: string, includeConfig = true): Observable<Project | null> {
    if (!projectId) {
      return of(null);
    }

    return this.getAllProjects(true).pipe(
      map((projects) => projects.find((p:any) => p.projectId === projectId) || null),
      catchError(() => of(null))
    );
  }

  getProjectConfig(projectId: string): Observable<any | null> {
    if (!projectId) {
      return of(null);
     }
    return this.http
      .get<any>(`${this.apiUrl}projects/${projectId}/config`)
      .pipe(catchError(() => of(null)));
  }

  getAllProjects(includePublic: boolean): Observable<any> {
    return this.http
      .get(`${this.apiUrl}projects?includePublic=${includePublic}`)
      .pipe(catchError((err:any) => of([])));
  }

  loadAllProjects(){
    this.getAllProjects(true).pipe(take(1)).subscribe((res:any) =>{
      this.allProjectSubject.next(res);
      this.loadFromSession();
    })
  }

  loadPrivateProjects(){
    this.getAllProjects(false).pipe(take(1)).subscribe((res:any) =>{
      this.userProjectSubject.next(res);
    })
  }

  findProject(includePublic: boolean, projectTitle: string): Observable<Project[]> {
    return this.http
      .get<Project[]>(`${this.apiUrl}projects?includePublic=${includePublic}&projectTitle=${projectTitle}`)
      .pipe(catchError(() => of([])));
  }

  checkExists(projectTitle: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.apiUrl}projects/exists/${projectTitle}`)
      .pipe(catchError(() => of(false)));
  }

  getProjectStats(includePublic: boolean): Observable<any> {
    return this.http
      .get(`${this.apiUrl}projects/stats?includePublic=${includePublic}`)
      .pipe(catchError(() => of(null)));
  }

  createProject(project: Project): Observable<Project> {
    return this.http
      .post<Project>(`${this.apiUrl}projects`, project)
      .pipe(catchError(() => of(null as any)));
  }

  updateProject(project: Project): Observable<Project> {
    return this.http
      .put<Project>(`${this.apiUrl}projects/${project.projectId}`, project)
      .pipe(catchError(() => of(null as any)));
  }

  deleteProject(project: Project): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}projects/${project.projectId}`).pipe(
      map(() => {
        this.setCurrentProject(null);
      }),
      catchError(() => of())
    );
  }

  loadFromSession(){
    const userVal = this.authService.getUserFromStorage();
    const projectId = userVal?.projectId || null;
    if(projectId){
      const projectData = this.allProjectSubject.value?.filter((item:any) => item.projectId == projectId)[0];
      this.setCurrentProject(projectData, false);
    }
    else{
      this.activatedRoute.queryParams.pipe(take(1)).subscribe((res:any)=>{
        if(res && res.projectId){
          const projectData = this.allProjectSubject.value?.filter((item:any) => item.projectId == res.projectId)[0];
          this.setCurrentProject(projectData, false);
        }
      });
    }
  }
}
