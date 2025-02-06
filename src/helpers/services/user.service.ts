import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Injectables
  private http = inject(HttpClient);

  // Variables
  apiURL:string = environment.restRoot;

  constructor() { }

  // loginUser(userData:any):Observable<any>{
  //   return this.http.post(`${this.apiURL}`,userData);
  // }

  authenticate(userData:FormData):Observable<any>{
    userData.append('client_id', environment.fimsClientId);
    userData.append('redirect_uri', `${environment.appRoot}/oauth`);
    userData.append('grant_type', 'password');
    return this.http.post(`${this.apiURL}oauth/accessToken`, userData);
  }

  registerUser(userData:any, inviteId?:string):Observable<any>{
    const url = `${this.apiURL}users` + (inviteId ? `?inviteId=${inviteId}` : '');
    return this.http.post(url,userData);
  }

  verifyUserName(name:string):Observable<any>{
    return this.http.get(`${this.apiURL}users/${name}`);
  }

  reqAccessToken(data:any):Observable<any>{
    return this.http.post(`${this.apiURL}oauth/accessToken`,data)
  }

  // client_id: Rng726w_hMKnvKSH2fUy
  // grant_type: password
  // password: Test@123
  // redirect_uri: //oauth
  // username: Sorabh

  resetPassword(data:any) {
    return this.http.post(`${this.apiURL}users/reset`, data)
  }

  sendResetPasswordToken(username:string):Observable<any>{
    return this.http.post(`${this.apiURL}/users/${username}/sendResetToken`, '');
  }
}
