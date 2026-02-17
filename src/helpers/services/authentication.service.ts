import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, map, Observable, of, Subscription, switchMap, throwError } from 'rxjs';
import { UserIdleService } from 'angular-user-idle';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserTimeOutComponent } from '../../app/dialogs/user-time-out/user-time-out.component';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private storageKey:string = 'biscicol';
  private currentUserSubject!: BehaviorSubject<any>;
  private userIdle = inject(UserIdleService);
  private modalService = inject(NgbModal);
  private idleTimeoutSub?: Subscription;
  currentUser!: Observable<any>;
  isLoggedIn:boolean = false;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService,
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
      const existingUser = this.getUserFromStorage() || {};
      const now = new Date().getTime();
      const expiresAt = this.resolveExpiresAt(userData, now, existingUser);
      let user:any = {
        ...existingUser,
        username,
        accessToken: userData.access_token,
        refreshToken: userData.refresh_token || existingUser.refreshToken,
        oAuthTimestamp: now,
        oAuthExpTimestamp: expiresAt,
        expires_at: expiresAt,
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
    if(!user || !user.accessToken) return true
    const currentTime = new Date().getTime();
    const expTime = Number(user.expires_at || user.oAuthExpTimestamp || 0);
    if (!expTime) return true;
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
    this.idleTimeoutSub?.unsubscribe();
    this.idleTimeoutSub = this.userIdle.onTimeout().subscribe((res:any) => {
      if(res){
        this.logoutUser(false, '/login');
        this.modalService.open(UserTimeOutComponent, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false });
      }
    })
  }

  ensureActiveSession(): Observable<boolean> {
    const user = this.getUserFromStorage();
    if (!user?.accessToken) {
      return this.forceRelogin();
    }

    return this.userService.introspectToken().pipe(
      map((res:any) => !!res?.active),
      catchError(() => of(false)),
      switchMap((active:boolean) => active ? of(true) : this.refreshAndRetryIntrospect(user))
    );
  }

  private refreshAndRetryIntrospect(user:any): Observable<boolean> {
    if (!user?.refreshToken) return this.forceRelogin();

    return this.userService.refreshUserToken(user.refreshToken).pipe(
      switchMap((res:any) => {
        if (!res?.access_token || !res?.refresh_token) return this.forceRelogin();
        this.saveUser(res, user?.username);
        return this.userService.introspectToken().pipe(
          map((introspect:any) => !!introspect?.active),
          catchError(() => of(false)),
          switchMap((active:boolean) => active ? of(true) : this.forceRelogin())
        );
      }),
      catchError(() => this.forceRelogin())
    );
  }

  private forceRelogin(): Observable<never> {
    this.logoutUser(false, '/login');
    return throwError(() => ({
      status: 401,
      error: {
        usrMessage: 'Session expired. Please log in again.',
        developerMessage: '',
        httpStatusCode: 401,
      }
    }));
  }

  private resolveExpiresAt(userData:any, now:number, existingUser:any): number {
    const explicitExpiresAt = Number(userData?.expires_at);
    if (Number.isFinite(explicitExpiresAt) && explicitExpiresAt > now) return explicitExpiresAt;

    const expiresIn = Number(userData?.expires_in);
    if (Number.isFinite(expiresIn) && expiresIn > 0) return now + (expiresIn * 1000);

    const existingExpiresAt = Number(existingUser?.expires_at || existingUser?.oAuthExpTimestamp || 0);
    if (Number.isFinite(existingExpiresAt) && existingExpiresAt > now) return existingExpiresAt;

    return now + (12 * 60 * 60 * 1000);
  }
}
