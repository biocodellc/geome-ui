import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../helpers/services/user.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Injectors
  router = inject(Router);
  userService = inject(UserService);
  fb:FormBuilder = inject(FormBuilder);
  toastrService = inject(ToastrService);
  authService = inject(AuthenticationService);
  
  // Variables
  loginForm!:FormGroup;
  isLoading:boolean = false;
  activePage:string = 'login';

  constructor(){
    this.initForm();
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
      switchMap(response => {
        this.authService.saveUser(response, this.getControlVal('username'));
        return this.userService.getUserData(this.getControlVal('username'), response.access_token)
      }),
      catchError(e => of(e))
    )
    .subscribe({
      next: (res:any)=>{
        this.authService.setCurrentUser(res);
        this.toastrService.success('Login Successful');
        this.router.navigate(['']);
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
    this.userService.sendResetPasswordToken(this.getControlVal('username')).subscribe({
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
}
