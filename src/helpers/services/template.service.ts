import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  // Injectables
  private http = inject(HttpClient);

  // Variables
  apiURL:string = environment.restRoot;
  private headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  getAllTempates(projectId:number):Observable<any>{
    return this.http.get(`${this.apiURL}projects/${projectId}/templates`);
  }

  generateTempate(projectId:number, worksheetTemplate:any):Observable<any>{
    return this.http.post(`${this.apiURL}projects/${projectId}/templates/generate`, worksheetTemplate);
  }

  saveTempates(projectId:number, templateName:string, data:any):Observable<any>{
    return this.http.post(`${this.apiURL}projects/${projectId}/templates/${templateName}`, this.formatFormData(data), { headers: this.headers });
  }

  deleteTempates(projectId:number, templateName:string):Observable<any>{
    return this.http.delete(`${this.apiURL}projects/${projectId}/templates/${templateName}`);
  }

  // Helper
  formattedReqBody(body:any):any{
    return new URLSearchParams(Object.entries(body));
  }

  formatFormData(formData:FormData):any{
    const params = new URLSearchParams();
    formData.forEach((val:any, key:any)=> params.append(key, val));
    return params;
  }
}
