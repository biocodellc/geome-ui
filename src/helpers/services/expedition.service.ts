import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

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

  stats(projectId:string, expeditionCode?:any) {
    let url = `${this.apiURL}projects/${projectId}/expeditions/stats`;
    if (expeditionCode) url += `?expeditionCode=${expeditionCode}`;
    return this.http.get(url);
  }

  getExpeditionsForUser(projectId:string, includePrivate = false) {
    return this.http.get(`${this.apiURL}projects/${projectId}/expeditions?user&includePrivate=${includePrivate}`);
  }

  // Helper
  private formattedReqBody(body:any):any{
    return new URLSearchParams(Object.entries(body));
  }
}
