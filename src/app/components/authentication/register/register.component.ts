import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../helpers/services/user.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MustMatch } from '../../../../helpers/validators/must-match.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  // Injectors
  fb:FormBuilder = inject(FormBuilder);
  userService = inject(UserService);
    
  // Variables
  registerForm!:FormGroup;
  isLoading:boolean = false;
  emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  passwordReg:string = '(?=\\D*\\d)(?=[^a-z]*[a-z]).{8,30}';
  
  constructor(){
    this.initForm();
  }
  
  initForm(){
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(this.emailReg)]],
      institution: [''],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(this.passwordReg)]],
      verifyPass: ['', [Validators.required]],
    },{
      validator: MustMatch('password', 'verifyPass'),
    })
  }

  register(){
    this.registerForm.markAllAsTouched();
    if(this.registerForm.invalid) return;

    this.isLoading = true;
    let data = { ...this.registerForm.value };
    delete data['verifyPass'];
    console.log(data);
    return;
    this.userService.registerUser(data).subscribe({
      next: (res:any)=>{},
      error: (err:any)=>{}
    })
  }

  get form(){ return this.registerForm.controls; }

  getControlVal(controlName:string){
    return this.form[controlName].value;
  }
}
