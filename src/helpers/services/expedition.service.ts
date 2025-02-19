import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpeditionService {
  // Injectables
  private http = inject(HttpClient);

  // Variables
  private apiURL: string = environment.restRoot;
  private headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  stats(projectId:number, expeditionCode?:any) {
    let url = `${this.apiURL}projects/${projectId}/expeditions/stats`;
    if (expeditionCode) url += `?expeditionCode=${expeditionCode}`;
    return this.http.get(url);
  }

  getExpeditionsForUser(projectId:number, includePrivate = false) {
    return this.http.get(`${this.apiURL}projects/${projectId}/expeditions?user&includePrivate=${includePrivate}`);
  }

  getExpeditionByCode(projectId:string, code:string):Observable<any>{
    return this.http.get(`${this.apiURL}projects/${projectId}/expeditions/${code}`);
  }

  createExpedition(projectId:number, data:any):Observable<any>{
    return this.http.post(`${this.apiURL}projects/${projectId}/expeditions/${data.expeditionCode}`,data);
  }

  updateExpedition(projectId:number, data:any):Observable<any>{
    return this.http.put(`${this.apiURL}projects/${projectId}/expeditions/${data.expeditionCode}`,data);
  }

  deleteExpedition(projectId:number, data:any):Observable<any>{
    return this.http.delete(`${this.apiURL}projects/${projectId}/expeditions/${data.expeditionCode}`);
  }

  // Helper
  private formattedReqBody(body:any):any{
    return new URLSearchParams(Object.entries(body));
  }
}
