import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../helpers/services/user.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, Subject, switchMap, take, takeUntil, throwError } from 'rxjs';
import { RouteTrackerService } from '../../../../helpers/services/route-track.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy{
  // Injectors
  router = inject(Router);
  userService = inject(UserService);
  fb:FormBuilder = inject(FormBuilder);
  toastrService = inject(ToastrService);
  authService = inject(AuthenticationService);
  routeTrackService = inject(RouteTrackerService);
  
  // Variables
  private destroy$ = new Subject<void>();
  loginForm!:FormGroup;
  isLoading:boolean = false;
  activePage:string = 'login';
  previousUrl:string = '';

  constructor(){
    this.previousUrl = this.routeTrackService.getPreviousUrl();
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      if(x) this.router.navigateByUrl(this.previousUrl);
    })
  }

  initForm(){
    this.loginForm = this.fb.group({
      username: ['', [ Validators.required]],
      password: ['', [Validators.required]]
    })
  }

  login(){
    this.loginForm.markAllAsTouched();
    if(this.loginForm.invalid) return;

    // Proceeding Login Process
    this.isLoading = true;
    this.userService.authenticate(this.loginForm.value)
    .pipe(
      take(1),
      takeUntil(this.destroy$),
      switchMap(response => {
        this.authService.saveUser(response, this.getControlVal('username'));
        return this.userService.getUserData(this.getControlVal('username'))
      }),
      catchError(e => throwError(() => e))
    )
    .subscribe({
      next: (res:any)=>{
        this.authService.setCurrentUser(res);
        this.toastrService.success('Login Successful');
        this.router.navigateByUrl(this.previousUrl);
      },
      error: (err:any)=>{
        this.toastrService.error(err.error?.usrMessage || 'Something went wrong!');
        this.isLoading = false;
      }
    })
  }

  sendResetPassReq(){
    this.form['username'].markAsTouched();
    if(this.form['username'].invalid) return;

    // Proceed API Hit with username
    this.isLoading = true;
    this.userService.sendResetPasswordToken(this.getControlVal('username'))
    .pipe(take(1), takeUntil(this.destroy$))
    .subscribe({
      next: (res:any)=>{
        this.isLoading = false;
        this.toastrService.success('If you have provided a valid username, check your email for further instructions.');
      },
      error: (err:any)=>{
        this.toastrService.error(err.error?.usrMessage || 'Something went wrong!');
        this.isLoading = false;
      }
    })
  }

  get form(){ return this.loginForm.controls; }

  getControlVal(controlName:string){ return this.form[controlName].value; }

  changeMode(page:string){ this.activePage = page };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
