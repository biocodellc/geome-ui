import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, take } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProjectConfig } from '../models/projectConfig.model';
import { cloneDeep, isEqual } from 'lodash';

const { restRoot } = environment;

@Injectable({
  providedIn: 'root',
})
export class ProjectConfigurationService {
  private initialCurrentProj$:BehaviorSubject<any> = new BehaviorSubject(null);
  private updatedCurrentProj$:BehaviorSubject<any> = new BehaviorSubject(null);
  allProjConfigSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  
  constructor(private http: HttpClient){
    this.setAllProjConfig();
  }

  private all(networkApproved = false, includeUser = false): Observable<any[]> {
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

  // Helpers Functions
  private setAllProjConfig(){
    this.all().pipe(take(1)).subscribe({
      next: (res:any)=> this.allProjConfigSubject.next(res)
    })
  }

  setInitialProjVal(data:any){
    this.initialCurrentProj$.next(cloneDeep(data));
    this.updateCurrentProj(cloneDeep(data));
  }

  getInitialProjVal():Observable<any>{
    return this.initialCurrentProj$.asObservable();
  }

  updateCurrentProj(data:any){
    this.updatedCurrentProj$.next(cloneDeep(data));
  }

  getUpdatedCurrentProj():Observable<any>{
    return this.updatedCurrentProj$.asObservable();
  }

  getUpdatedCurrentProjVal():any{
    return this.updatedCurrentProj$.value;
  }

  get isConfigChanges(){
    return !isEqual(this.initialCurrentProj$.value, this.updatedCurrentProj$.value);
  }

  clearCurrentProject(){
    this.setInitialProjVal(null);
  }

  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
  
    if (typeof obj1 !== 'object' || obj1 === null ||
        typeof obj2 !== 'object' || obj2 === null) {
      return false;
    }
  
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) return false;
  
    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(obj1[key], obj2[key])) return false;
    }
  
    return true;
  }
}
