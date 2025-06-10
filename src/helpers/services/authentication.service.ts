import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserIdleService } from 'angular-user-idle';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserTimeOutComponent } from '../../app/dialogs/user-time-out/user-time-out.component';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private storageKey:string = 'biscicol';
  private currentUserSubject!: BehaviorSubject<any>;
  private userIdle = inject(UserIdleService);
  private modalService = inject(NgbModal);
  currentUser!: Observable<any>;
  isLoggedIn:boolean = false;

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {
    this.checkUser();
  }

  checkUser(){
    let user:any = this.getUserFromStorage();
    if(user && user?.accessToken && !this.isTokenTimeExpired(user)){
      this.isLoggedIn = true;
      this.currentUserSubject = new BehaviorSubject<any>(user);
      this.currentUser = this.currentUserSubject.asObservable();
      this.startWatchingIdel();
    }
    else{
      this.isLoggedIn = false;
      this.currentUserSubject = new BehaviorSubject<any>(null);
      this.currentUser = this.currentUserSubject.asObservable();
      this.resetUser();
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
        oAuthExpTimestamp: new Date().getTime() + (4 * 60 * 60 * 1000),
        ...this.getUserFromStorage()
      }
      localStorage.setItem( this.storageKey, btoa(JSON.stringify(user)) );
      this.startWatchingIdel();
    }
  }

  apendUserVal(key:string, val:any){
    const userData = this.getUserFromStorage() || {};
    userData[key] = val;
    localStorage.setItem( this.storageKey, btoa(JSON.stringify(userData)) );
  }

  setCurrentUser(user:any){
    if(JSON.stringify(user) == JSON.stringify(this.currentUserSubject.value)) return;
    this.currentUserSubject.next(user);
    this.currentUser = this.currentUserSubject.asObservable();
    this.isLoggedIn = user ? true : false;
  }

  logoutUser(showToastr:boolean = true, route:string = '/'){
    this.userIdle.stopTimer();
    this.userIdle.stopWatching();
    this.resetUser();
    this.router.navigate([route]);
    if(showToastr) this.toastr.success('User Logged Out!');
  }

  resetUser(){
    const user = this.getUserFromStorage();
    const newData =  user?.projectId ? { projectId: user?.projectId } : null;
    this.setCurrentUser(null);
    this.isLoggedIn = false;
    if(newData) localStorage.setItem( this.storageKey, btoa(JSON.stringify(newData)) );
    else localStorage.removeItem(this.storageKey);
  }

  isTokenTimeExpired(user:any):boolean{
    if(!user || !user.accessToken || !user.oAuthTimestamp || !user.oAuthExpTimestamp) return true
    const currentTime = new Date().getTime();
    const expTime = user.oAuthExpTimestamp;
    if(expTime > currentTime - 2000) return false
    else return true;
  }

  getUserFromStorage():any{
    const storedUser:any = localStorage.getItem(this.storageKey);
    const parsedData = storedUser ? atob(storedUser) : null;
    if(parsedData) return JSON.parse(parsedData);
    else return null
  }

  startWatchingIdel(){
    this.userIdle.startWatching();
    this.userIdle.onTimeout().subscribe((res:any) => {
      if(res){
        this.logoutUser(false, '/login');
        this.modalService.open(UserTimeOutComponent, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false });
      }
    })
  }
}
