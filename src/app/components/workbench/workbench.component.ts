import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthenticationService } from '../../../helpers/services/authentication.service';
import { Subject, takeUntil } from 'rxjs';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workbench',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, LoaderComponent, CommonModule],
  templateUrl: './workbench.component.html',
  styleUrl: './workbench.component.scss'
})
export class WorkbenchComponent implements OnDestroy{
  // Injectables
  dataService = inject(DummyDataService)
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
