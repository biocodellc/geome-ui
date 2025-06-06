import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../helpers/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { passwordStrengthValidator } from '../../../../helpers/validators/passowrd.validator';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { RouteTrackerService } from '../../../../helpers/services/route-track.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnDestroy{
  // Injectors
  fb: FormBuilder = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute);
  userService = inject(UserService);
  toastr = inject(ToastrService);
  router = inject(Router);
  authService = inject(AuthenticationService);
  routeTrackService = inject(RouteTrackerService);

  // Variables
  private destroy$ = new Subject<void>();
  resetForm!: FormGroup;
  isLoading: boolean = false;
  token:string = '';
  passwordReg:string = '(?=\\D*\\d)(?=[^a-z]*[a-z]).{8,30}';

  constructor() {
    this.initForm();
    this.activatedRoute.queryParamMap.pipe(take(1), takeUntil(this.destroy$)).subscribe(
      (res:any)=>{
        if(res.params && res.params?.resetToken) this.token = res.params?.resetToken;
      }
    )
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      if(x) this.router.navigateByUrl(this.routeTrackService.getPreviousUrl());
    })
  }

  get form() { return this.resetForm.controls; }

  initForm() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, passwordStrengthValidator()]]
    })
  }

  resetPass() {
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid) return;

    // Proceeding Login Process
    this.isLoading = true;
    const data = { resetToken: this.token, password: this.form['password'].value };
    this.userService.resetPassword(data).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res.success){
          this.toastr.success('Successfully reset your password');
          this.router.navigate(['/login']);
        }
      },
      error: (err:any)=>{
        this.toastr.error(err.error?.usrMessage || 'Something went wrong!');
        this.isLoading = false;
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
