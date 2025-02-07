import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../helpers/services/authentication.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule, NgbDropdownModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() largeDevice:boolean = false;
  @Input() currentUser:any;

  // Injectors
  authService = inject(AuthenticationService);

  signoutUser(){ this.authService.logoutUser(); }
}
