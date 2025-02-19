import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../helpers/services/user.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { Subject, take, takeUntil } from 'rxjs';

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
  authService = inject(AuthenticationService);

  //Variables
  private destroy$ = new Subject<void>();
  userForm!:FormGroup;
  currentUser:any;

  constructor(){
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentUser = res;
      this.setCurrentUser();
    });
  }

  initForm(){
    this.userForm = this.fb.group({
      email: [''],
      firstName: [''],
      lastName: [''],
      institution: ['']
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

  get form(){
    return this.userForm.controls;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
