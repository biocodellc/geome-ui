import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../helpers/services/user.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MustMatch } from '../../../../helpers/validators/must-match.validator';
import { catchError, debounceTime, map, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  // Injectors
  router = inject(Router);
  fb: FormBuilder = inject(FormBuilder);
  userService = inject(UserService);
  toastrService = inject(ToastrService);
  authService = inject(AuthenticationService);

  // Variables
  private destroy$ = new Subject<void>();
  registerForm!: FormGroup;
  isLoading: boolean = false;
  isUserNameTaken: boolean = false;
  emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  passwordReg: string = '(?=\\D*\\d)(?=[^a-z]*[a-z]).{8,30}';

  constructor() {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(this.emailReg)]],
      institution: [''],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(this.passwordReg)]],
      verifyPass: ['', [Validators.required]],
    }, {
      validator: MustMatch('password', 'verifyPass'),
    })
    this.form['username'].valueChanges
    .pipe(debounceTime(500), takeUntil(this.destroy$))
    .subscribe(val => this.validateName(val));
  }

  register() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    let data = { ...this.registerForm.value };
    let userCred = { username: this.getControlVal('username'), password: this.getControlVal('password') };
    delete data['verifyPass'];

    this.userService.registerUser(data)
      .pipe(
        take(1), takeUntil(this.destroy$),
        switchMap(userData => 
          this.userService.authenticate(userCred).pipe( map( authData => ({ authData, userData }) ))
        ),
        catchError(e => of(e))
      )
      .subscribe({
        next: (res: any) => {
          this.authService.saveUser(res.authData, this.getControlVal('username'));
          this.authService.setCurrentUser(res.userData);
          this.toastrService.success('Register Successful');
          this.router.navigate(['']);
        },
        error: (err: any) =>{
          this.isLoading = false;
          this.toastrService.error('Something went wrong in API!')
        }
      })
  }

  get form() { return this.registerForm.controls; }

  getControlVal(controlName: string) { return this.form[controlName].value; }

  validateName(name: string) {
    const username = name.trim();
    if (username) {
      this.userService.verifyUserName(username).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res) this.isUserNameTaken = true
          else this.isUserNameTaken = false;
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
