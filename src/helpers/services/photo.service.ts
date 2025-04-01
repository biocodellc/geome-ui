import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private restRoot = environment.restRoot;

  private headers = new HttpHeaders({
      'Accept': "*/*",
      'Content-Type': 'application/x-zip-compressed'
    });

  constructor(private http: HttpClient) {}

  upload(
    projectId: string,
    expeditionCode: string,
    entity: string,
    file: File,
    isResume = false,
    ignoreId:any
  ): Observable<{ success: boolean; errors: string[]; warnings: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.restRoot}photos/${entity}/upload`;
    const params:any = {
      projectId,
      ignoreId: ignoreId.toString(),
      type: isResume ? 'resume' : 'resumable',
    };
    if(expeditionCode) params.expeditionCode = expeditionCode;

    return this.http.put<{ success: boolean; messages: { errors?: string[]; warnings?: string[] } }>(url, formData, { params, headers: this.headers })
      .pipe(
        map(res => ({
          success: res.success,
          errors: res.messages.errors || [],
          warnings: res.messages.warnings || [],
        })),
        catchError(this.handleError)
      );
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
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.restRoot}photos/${entity}/upload`;
    const params = { projectId, expeditionCode };

    return this.http.put<HttpEvent<any>>(url, formData, { params, reportProgress: true, observe: 'events' })
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
    return throwError(() => new Error('Photo upload failed'));
  }
}
