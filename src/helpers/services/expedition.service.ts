import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of, shareReplay, startWith, switchMap, tap, throwError } from 'rxjs';
import { ProjectAccess } from './project-access.service';

export interface ExpeditionOverview {
  items: any[];
  statisticsLoading: boolean;
  statisticsError: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpeditionService {
  // Injectables
  private http = inject(HttpClient);

  // Variables
  private apiURL: string = environment.restRoot;
  private accessibleCache = new WeakMap<ProjectAccess, { expiresAt: number; request: Observable<any[]> }>();
  private statisticsCache = new WeakMap<ProjectAccess, { expiresAt: number; request: Observable<any[]> }>();

  private invalidateCaches(): void {
    this.accessibleCache = new WeakMap();
    this.statisticsCache = new WeakMap();
  }
  private headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  stats(projectId:number, expeditionCode?:any) {
    let url = `${this.apiURL}projects/${projectId}/expeditions/stats`;
    if (expeditionCode) url += `?expeditionCode=${expeditionCode}`;
    return this.http.get(url);
  }

  getAllExpeditions(projectId:number):Observable<any>{
    return this.http.get(`${this.apiURL}projects/${projectId}/expeditions`);
  }

  getExpeditionsForUser(projectId:number, includePrivate = false):Observable<any> {
    return this.http.get(`${this.apiURL}projects/${projectId}/expeditions?user&includePrivate=${includePrivate}`);
  }

  getExpeditionByCode(projectId:number, code:string):Observable<any>{
    return this.http.get(`${this.apiURL}projects/${projectId}/expeditions/${code}`);
  }

  createExpedition(projectId:number, data:any):Observable<any>{
    return this.http.post(`${this.apiURL}projects/${projectId}/expeditions/${data.expeditionCode}`,data)
      .pipe(tap(() => this.invalidateCaches()));
  }

  updateExpedition(projectId:number, data:any):Observable<any>{
    return this.http.put(`${this.apiURL}projects/${projectId}/expeditions/${data.expeditionCode}`,data)
      .pipe(tap(() => this.invalidateCaches()));
  }

  deleteExpedition(projectId:number, data:any):Observable<any>{
    return this.http.delete(`${this.apiURL}projects/${projectId}/expeditions/${data.expeditionCode}`)
      .pipe(tap(() => this.invalidateCaches()));
  }

  getExpeditionForAdmin(projectId:number):Observable<any>{
    return this.http.get(`${this.apiURL}projects/${projectId}/expeditions?admin&includePrivate=true`);
  }

  getAccessibleExpeditions(access: ProjectAccess): Observable<any[]> {
    if (access.loading || access.error || !access.isMember) {
      return throwError(() => new Error(access.error || 'Project membership has not been verified.'));
    }
    // The access object is specific to the verified account and selected project.
    const cached = this.accessibleCache.get(access);
    if (cached && cached.expiresAt > Date.now()) return cached.request;
    const request = access.isProjectOwner
      ? this.getExpeditionForAdmin(access.project.projectId)
      : this.getExpeditionsForUser(access.project.projectId, true);
    const entry = { expiresAt: Infinity, request: undefined! as Observable<any[]> };
    entry.request = request.pipe(map(items => {
      if (!Array.isArray(items)) throw new Error('Invalid expedition response');
      return items;
    }), tap(() => entry.expiresAt = Date.now() + 30_000), catchError(error => {
      this.accessibleCache.delete(access);
      return throwError(() => error);
    }), shareReplay({ bufferSize: 1, refCount: false }));
    this.accessibleCache.set(access, entry);
    return entry.request;
  }

  getAccessibleExpeditionOverview(access: ProjectAccess): Observable<ExpeditionOverview> {
    return this.getAccessibleExpeditions(access).pipe(switchMap(items => {
      let cached = this.statisticsCache.get(access);
      if (!cached || cached.expiresAt <= Date.now()) {
        const entry = { expiresAt: Infinity, request: undefined! as Observable<any[]> };
        entry.request = this.stats(access.project.projectId).pipe(
          map(rows => {
            if (!Array.isArray(rows)) throw new Error('Invalid expedition statistics response');
            return rows;
          }),
          tap(() => entry.expiresAt = Date.now() + 30_000),
          catchError(error => { this.statisticsCache.delete(access); return throwError(() => error); }),
          shareReplay({ bufferSize: 1, refCount: false })
        );
        cached = entry;
        this.statisticsCache.set(access, entry);
      }
      return cached.request.pipe(
        map(rows => {
          const byCode = new Map(rows.map(row => [row.expeditionCode, row]));
          return { items: items.map(item => {
            const stats = byCode.get(item.expeditionCode);
            if (!stats) return item;
            // Enrich permitted rows only; statistics never establish visibility or ownership.
            const fields: any = {};
            Object.keys(stats).filter(key => key.endsWith('Count') || ['created', 'latestDataModification', 'latestDataModificationUsername', 'ownerFirstName', 'ownerLastName', 'ownerUsername'].includes(key))
              .forEach(key => fields[key] = stats[key]);
            return { ...item, ...fields };
          }), statisticsLoading: false, statisticsError: '' };
        }),
        catchError(() => of({ items, statisticsLoading: false, statisticsError: 'Unable to load expedition statistics. Activity and count sorting may be unavailable.' })),
        startWith({ items, statisticsLoading: true, statisticsError: '' })
      );
    }));
  }

  // Helper
  private formattedReqBody(body:any):any{
    return new URLSearchParams(Object.entries(body));
  }
}
