import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { AuthenticationService } from '../helpers/services/authentication.service';
import { ProjectService } from '../helpers/services/project.service';
import { UserService } from '../helpers/services/user.service';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy{
  // Injectables
  authService = inject(AuthenticationService);
  projectService = inject(ProjectService);
  userService = inject(UserService);

  // Variables
  private destroy$ = new Subject<void>();
  title = 'geome';
  isLargeDevice:boolean = false;
  currentUser:any;

  @HostListener('window:resize')
  onResize(){
    const windowWidth = window.innerWidth;
    if(windowWidth > 991) this.isLargeDevice = true
    else this.isLargeDevice = false;
  }

  constructor(){
    this.onResize();
    this.authService.currentUser.pipe(takeUntil(this.destroy$))
    .subscribe((x:any)=>{
      this.currentUser = x;
      if(x && !x.accessToken) this.getUserProjects()
      else if(x && x.accessToken) this.getUserDetails(x)
    })
    this.projectService.loadAllProjects();
  }

  getUserDetails(user:any){
    this.userService.getUserData(user.username, user.accessToken).pipe(take(1), takeUntil(this.destroy$))
    .subscribe({
      next: (res:any) => this.authService.setCurrentUser(res)
    })
  }

  getUserProjects(){
    this.projectService.getAllProjects(false).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res:any)=> this.projectService.userProjectSubject.next(res)
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
