import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';
import { ProjectConfig } from '../models/projectConfig.model';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  // Injectors
  http = inject(HttpClient);

  // Variables
  apiUrl:string = environment.restRoot;

  get():Observable<any>{
    return this.http.get(`${this.apiUrl}network`)
  }

  getConfig():Observable<any>{
    return this.http.get<any>(`${this.apiUrl}network/config`).pipe( map(res => new ProjectConfig(res)) );
  }
}
