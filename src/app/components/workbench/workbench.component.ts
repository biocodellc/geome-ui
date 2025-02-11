import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthenticationService } from '../../../helpers/services/authentication.service';

@Component({
  selector: 'app-workbench',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './workbench.component.html',
  styleUrl: './workbench.component.scss'
})
export class WorkbenchComponent {
  // Injectables
  authService = inject(AuthenticationService);

  // Variables
  currentUser:any;

  constructor(){
    this.authService.currentUser.subscribe((x:any) => this.currentUser = x );
  }
}
