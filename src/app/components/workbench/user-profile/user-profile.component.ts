import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../helpers/services/user.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MustMatch } from '../../../../helpers/validators/must-match.validator';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  // Injectors
  fb = inject(FormBuilder);
  userService = inject(UserService);
  toastrService = inject(ToastrService);
  authService = inject(AuthenticationService);

  //Variables
  private destroy$ = new Subject<void>();
  currentUser:any;
  userForm!:FormGroup;
  passwordForm!:FormGroup;
  isLoading:boolean = true;
  emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  passwordReg: string = '(?=\\D*\\d)(?=[^a-z]*[a-z]).{8,30}';

  constructor(){
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentUser = res;
      this.setCurrentUser();
    });
  }

  initForm(){
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(this.emailReg)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      institution: ['', Validators.required]
    })
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.pattern(this.passwordReg)]],
      verifyPassword: [''],
    }, {
      validator: MustMatch('newPassword', 'verifyPassword'),
    })
  }

  setCurrentUser(){
    if(this.currentUser && this.currentUser?.userId){
      ['email', 'firstName', 'lastName', 'institution'].forEach((key:string) => {
        this.form[key].setValue(this.currentUser[key]);
        this.form[key].updateValueAndValidity();
      })
    }
  }

  get form(){ return this.userForm.controls; }

  get passForm() { return this.passwordForm.controls; }

  updateUserData(){
    this.userForm.markAllAsTouched();
    if(this.userForm.invalid) return;
    this.isLoading = true;
    const updatedData = { ...this.currentUser, ...this.userForm.value };
    this.userService.updateUserData(this.currentUser.username, updatedData).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res){
          this.isLoading = false;
          this.authService.setCurrentUser(res);
          this.toastrService.success('Profile Updated.');
        }
      },
      error: ()=> this.isLoading = false
    })
  }

  updateUserPassword(){
    this.passwordForm.markAllAsTouched();
    if(this.passwordForm.invalid) return;
    this.isLoading = true;
    const data = { ...this.passwordForm.value };
    delete data['verifyPassword'];
    this.userService.updatePassword(this.currentUser.username, data).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res){
          this.isLoading = false;
          this.passwordForm.reset();
          this.toastrService.success('Password Updated.');
        }
      },
      error: ()=> this.isLoading = false
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
