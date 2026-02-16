import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private restRoot = environment.restRoot;

  private defaultHeaders = new HttpHeaders({
    Accept: '*/*',
  });

  constructor(private http: HttpClient) {}

  upload(
    projectId: string,
    expeditionCode: string,
    entity: string,
    file: File,
    isResume = false,
    ignoreId:any,
    onProgress?: (progress: { loaded: number; total: number; percent: number }) => void
  ): Observable<{ success: boolean; errors: string[]; warnings: string[] }> {
    const url = `${this.restRoot}photos/${entity}/upload`;
    const params:any = {
      projectId,
      ignoreId: ignoreId.toString(),
      type: isResume ? 'resume' : 'resumable',
    };
    if(expeditionCode) params.expeditionCode = expeditionCode;

    return new Observable<{ success: boolean; errors: string[]; warnings: string[] }>(observer => {
      this.http.put<HttpEvent<any>>(url, file, {
        params,
        headers: this.getZipHeaders(file),
        reportProgress: true,
        observe: 'events'
      }).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const percent = Math.round((100 * event.loaded) / event.total);
            onProgress?.({ loaded: event.loaded, total: event.total, percent });
            return;
          }

          if (event.type === HttpEventType.Response) {
            const res = event.body || {};
            observer.next({
              success: !!res.success,
              errors: res?.messages?.errors || [],
              warnings: res?.messages?.warnings || [],
            });
            observer.complete();
          }
        },
        error: (error) => observer.error(error)
      });
    }).pipe(catchError(this.handleError));
  }

  getResumeSize(projectId: string, expeditionCode: string, entity: string): Observable<number> {
    const url = `${this.restRoot}photos/${entity}/upload/progress`;
    const params = { projectId, expeditionCode };
    
    return this.http.get<{ size?: number }>(url, { params })
      .pipe(
        map(response => response.size || 0),
        catchError(error => {
          if (error instanceof HttpErrorResponse && error.status !== 400) {
            console.error('Error fetching resume upload size', error);
          }
          return throwError(() => new Error('Failed to fetch resume upload size'));
        })
      );
  }

  uploadWithProgress(
    projectId: string,
    expeditionCode: string,
    entity: string,
    file: File
  ): Observable<number> {
    const url = `${this.restRoot}photos/${entity}/upload`;
    const params = { projectId, expeditionCode };

    return this.http.put<HttpEvent<any>>(url, file, { params, headers: this.getZipHeaders(file), reportProgress: true, observe: 'events' })
      .pipe(
        map(event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            return Math.round((100 * event.loaded) / event.total);
          }
          return 0;
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Photo upload failed', error);
    return throwError(() => error);
  }

  private getZipHeaders(file?: File): HttpHeaders {
    const contentType = file?.type || 'application/zip';
    return this.defaultHeaders.set('Content-Type', contentType);
  }
}
