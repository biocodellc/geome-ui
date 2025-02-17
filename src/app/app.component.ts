import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { AuthenticationService } from '../helpers/services/authentication.service';
import { ProjectService } from '../helpers/services/project.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Injectables
  authService = inject(AuthenticationService);
  projectService = inject(ProjectService);

  // Variables
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
    this.authService.currentUser.subscribe((x:any)=>{
      this.currentUser = x;
    })
    this.projectService.loadFromSession();
  }
}
