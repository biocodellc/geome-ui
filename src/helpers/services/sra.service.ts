import { HttpClient, HttpHeaders, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SraService {
  private http = inject(HttpClient);
  private restRoot = environment.restRoot;

  upload(
    metadata: any,
    file: File,
    isResume = false,
    onProgress?: (progress: { loaded: number; total: number; percent: number }) => void
  ): Observable<any> {
    // Step 1: Initialize upload session
    return new Observable(observer => {
      this.http.put<{ uploadId: string }>(`${this.restRoot}sra/upload`, metadata).subscribe({
        next: initData => {
          const uploadId = initData?.uploadId;

          if (!uploadId) {
            observer.error(new Error('Upload initialization failed.'));
            return;
          }

          // Step 2: Upload file
          const headers = new HttpHeaders({ 'Content-Type': file.type });
          const params = new HttpParams()
            .set('id', uploadId)
            .set('type', isResume ? 'resume' : 'resumable');

          this.http.put(`${this.restRoot}sra/upload`, file, {
            headers,
            params,
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            catchError(error => {
              observer.error(error);
              return throwError(() => error);
            }),
            map((event: HttpEvent<any>) => {
              if (event.type === HttpEventType.UploadProgress && event.total) {
                const percent = Math.round((100 * event.loaded) / event.total);
                onProgress?.({ loaded: event.loaded, total: event.total, percent });
              } else if (event.type === HttpEventType.Response) {
                observer.next(event.body);
                observer.complete();
              }
            })
          ).subscribe();
        },
        error: err => observer.error(err)
      });
    });
  }

  getResumeSize(id: string): Observable<number> {
    return this.http.get<{ size: number }>(`${this.restRoot}sra/upload/progress`, {
      params: new HttpParams().set('id', id)
    }).pipe(
      map(res => res.size || 0),
      catchError(err => {
        if (err.status !== 400) {
          console.error('Error fetching resume upload size', err);
        }
        return [0]; // default resume size if error
      })
    );
  }
}
