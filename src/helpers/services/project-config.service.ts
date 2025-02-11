import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, take } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProjectConfig } from '../models/projectConfig.model';

const { restRoot } = environment;

@Injectable({
  providedIn: 'root',
})
export class ProjectConfigurationService {
  allProjConfigSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  constructor(private http: HttpClient){
    this.setAllProjConfig();
  }

  setAllProjConfig(){
    this.all().pipe(take(1)).subscribe({
      next: (res:any)=> this.allProjConfigSubject.next(res)
    })
  }

  all(networkApproved = false, includeUser = false): Observable<any[]> {
    const queryParams = `?${networkApproved ? 'networkApproved=true&' : ''}${
      includeUser ? 'user=true' : ''
    }`;

    return this.http.get<any[]>(`${restRoot}projects/configs${queryParams}`).pipe(
      map(data =>
        data.map(d =>
          d.config ? { ...d, config: new ProjectConfig(d.config) } : d
        )
      )
    );
  }

  get(id: number): Observable<any> {
    return this.http.get<any>(`${restRoot}projects/configs/${id}`).pipe(
      map(data => ({ ...data, config: new ProjectConfig(data.config) }))
    );
  }

  save(projectConfiguration: any): Observable<any> {
    return this.http.put<any>(
      `${restRoot}projects/configs/${projectConfiguration.id}`,
      projectConfiguration
    ).pipe(
      map(data => ({ ...data, config: new ProjectConfig(data.config) }))
    );
  }
}
