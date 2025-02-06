import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private storageKey:string = 'abcgeome-appxyz-Token';
  private currentUserSubject!: BehaviorSubject<any>;
  currentUser!: Observable<any>;
  isLoggedIn:boolean = false;

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {
    this.checkUser();
  }

  checkUser(){
    let val:any = this.getUserFromStorage,
    user:any;
    if(val) user = JSON.parse(val);
    if(user && user?.accessToken){
      this.isLoggedIn = true;
      this.currentUserSubject = new BehaviorSubject<any>(user);
      this.currentUser = this.currentUserSubject.asObservable();
    }
    else{
      this.isLoggedIn = false;
      this.currentUserSubject = new BehaviorSubject<any>(null);
      this.currentUser = this.currentUserSubject.asObservable();
    }
  }

  getCurrentUserVal(){
    return this.currentUserSubject.value;
  }

  saveUser(userData:any, username:string){
    if(userData.access_token){
      let user:any = {
        username,
        accessToken: userData.access_token,
        refreshToken: userData.refresh_token,
        oAuthTimestamp: new Date().getTime(),
      }
      localStorage.setItem( this.storageKey, btoa(JSON.stringify(user)) );
      this.setCurrentUser(user);
      this.isLoggedIn = true;
    }
  }

  setCurrentUser(user:any){
    if(JSON.stringify(user) == JSON.stringify(this.currentUserSubject.value)) return;
    this.currentUserSubject.next(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  isTokenExpired():boolean{
    const user = this.getCurrentUserVal();
    if(user && user.accessToken){
      // const decodedUser = jwtDecode(user.accessToken);
      // if(decodedUser && decodedUser.exp){
      //   let currentTime = new Date().getTime();
      //   let tokenExpTime = decodedUser.exp * 1000;
      //   let isTokenExp:any = (tokenExpTime - 2000 > currentTime) ? false : true;
      //   return isTokenExp;
      // }
      // else return true;
      return false;
    }
    else return true;
  }

  logoutUser(){
    this.resetUser();
    this.router.navigate(['/']);
    this.toastr.success('User Logged Out!');
  }

  resetUser(){
    localStorage.removeItem(this.storageKey);
    this.setCurrentUser(null);
    this.isLoggedIn = false;
  }

  get getUserFromStorage():any{
    const storedUser:any = localStorage.getItem(this.storageKey);
    if(storedUser) return atob(storedUser);
  }
}
