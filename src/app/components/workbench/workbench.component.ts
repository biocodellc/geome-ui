import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthenticationService } from '../../../helpers/services/authentication.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-workbench',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './workbench.component.html',
  styleUrl: './workbench.component.scss'
})
export class WorkbenchComponent implements OnDestroy{
  // Injectables
  authService = inject(AuthenticationService);

  // Variables
  private destroy$ = new Subject<void>();
  currentUser:any;

  constructor(){
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((x:any) => this.currentUser = x );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
