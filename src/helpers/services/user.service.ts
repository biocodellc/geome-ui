import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  getUserData(username:string, token:string):Observable<any>{
    return this.http.get(`${this.apiURL}users/${username}?access_token=${token}`);
  }

  authenticate(userData:any):Observable<any>{
    const data = {
      ...userData,
      client_id: environment.fimsClientId,
      redirect_uri: `${environment.appRoot}/oauth`,
      grant_type: 'password'
    }
    return this.http.post(`${this.apiURL}oauth/accessToken`, this.formattedReqBody(data), { headers: this.headers });
  }

  registerUser(userData:any, inviteId?:string):Observable<any>{
    const url = `${this.apiURL}users` + (inviteId ? `?inviteId=${inviteId}` : '');
    return this.http.post(url, userData);
  }

  verifyUserName(name:string):Observable<any>{
    return this.http.get(`${this.apiURL}users/${name}`);
  }

  resetPassword(data:any) {
    return this.http.post(`${this.apiURL}users/reset`, this.formattedReqBody(data), { headers: this.headers });
  }

  sendResetPasswordToken(username:string):Observable<any>{
    return this.http.post(`${this.apiURL}users/${username}/sendResetToken`, '');
  }

  refreshUserToken(refreshToken:string):Observable<any> {
    const data = {
      client_id: environment.fimsClientId,
      refresh_token: refreshToken
    };
    return this.http.post(`${this.apiURL}oauth/refresh`, this.formattedReqBody(data), { headers: this.headers });
  }


  // Helper
  formattedReqBody(body:any):any{
    return new URLSearchParams(Object.entries(body));
  }
}
