import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../helpers/services/user.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MustMatch } from '../../../../helpers/validators/must-match.validator';
import { catchError, debounceTime, map, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { passwordStrengthValidator } from '../../../../helpers/validators/passowrd.validator';
import { RouteTrackerService } from '../../../../helpers/services/route-track.service';

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
  activatedRoute = inject(ActivatedRoute);
  routeTrackService = inject(RouteTrackerService);

  // Variables
  private destroy$ = new Subject<void>();
  registerForm!: FormGroup;
  isLoading: boolean = false;
  isUserNameTaken: boolean = false;
  emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  passwordReg: string = '(?=\\D*\\d)(?=[^a-z]*[a-z]).{8,30}';

  constructor() {
    this.initForm();
    this.extractDataFromUrl();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      if(x) this.router.navigateByUrl(this.routeTrackService.getPreviousUrl());
    })
  }

  initForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(this.emailReg)]],
      institution: [''],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      verifyPass: ['', [Validators.required]],
      inviteId: ['']
    }, {
      validator: MustMatch('password', 'verifyPass'),
    })
    this.form['username'].valueChanges
    .pipe(debounceTime(500), takeUntil(this.destroy$))
    .subscribe(val => this.validateName(val));
  }

  extractDataFromUrl(){
    this.activatedRoute.queryParams.pipe(take(1)).subscribe((param:any)=>{
      if(param.email || param.inviteId){
        Object.keys(param).forEach((key:string)=> this.setControlVal(key, param[key]));
      }
    })
  }

  register() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    let data = { ...this.registerForm.value };
    let userCred = { username: this.getControlVal('username'), password: this.getControlVal('password') };
    delete data['verifyPass'];
    delete data['inviteId'];

    this.userService.registerUser(data, this.getControlVal('inviteId'))
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
          if(this.getControlVal('inviteId'))
            this.router.navigate(['/workbench','project-overview']);
          else this.router.navigate(['']);
        },
        error: (err: any) =>{
          this.isLoading = false;
          this.toastrService.error('Something went wrong in API!')
        }
      })
  }

  get form() { return this.registerForm.controls; }

  getControlVal(controlName: string) { return this.form[controlName].value; }

  setControlVal(controlName:string, val:any){
    this.form[controlName].setValue(val);
    this.form[controlName].updateValueAndValidity();
  }

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
