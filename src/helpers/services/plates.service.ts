import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlatesService {
  // Injectables
  private http = inject(HttpClient);

  // Variables
  apiURL: string = environment.restRoot;
  private headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  get(projectId:number, plateName:string):Observable<any>{
    return this.http.get(`${this.apiURL}tissues/plates/${projectId}/${plateName}`)
  }

  getAll(projectId:number):Observable<any>{
    return this.http.get(`${this.apiURL}tissues/plates/${projectId}`)
  }

  save(projectId:number, plateName:string, data:any):Observable<any>{
    return this.http.put(`${this.apiURL}tissues/plates/${projectId}/${plateName}`, this.formattedReqBody(data), { headers: this.headers });
  }

  create(projectId:number, plateName:string, data:any):Observable<any>{
    return this.http.post(`${this.apiURL}tissues/plates/${projectId}/${plateName}`, this.formattedReqBody(data), { headers: this.headers });
  }


  // Helper
  formattedReqBody(body:any):any{
    return new URLSearchParams(Object.entries(body));
  }
}
