import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../helpers/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Injectors
  fb:FormBuilder = inject(FormBuilder);
  userService = inject(UserService);
  
  // Variables
  loginForm!:FormGroup;
  isLoading:boolean = false;
  activePage:string = 'login';

  constructor(){
    this.initForm();
  }

  get form(){
    return this.loginForm.controls;
  }

  changeMode(page:string){ this.activePage = page };

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
    const data = new FormData();
    Object.keys(this.loginForm.value).forEach((key:string)=> data.append(key, this.form[key].value));
    this.userService.authenticate(data).subscribe({
      next: (res:any)=> console.log(res),
      error: (err:any)=>{}
    })
  }

  sendResetPassReq(){
    this.form['username'].markAsTouched();
    if(this.form['username'].invalid) return;

    // Proceed API Hit with username
    this.isLoading = true;
    this.userService.sendResetPasswordToken(this.form['username'].value).subscribe({
      next: (res:any)=> console.log(res),
      error: (err:any)=>{}
    })
  }
}
