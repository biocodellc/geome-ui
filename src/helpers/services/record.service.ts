import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private http = inject(HttpClient);
  private apiUrl = environment.restRoot;

  get(identifier:string, httpOpts?:any):Observable<any> {
    const re = new RegExp(/^ark:\/\d{5}\/[A-Za-z]+2$/);
    const path = re.exec(identifier) ? 'bcids/metadata/' : 'records/';

    return this.http.get(`${this.apiUrl}${path}${identifier}?includeParent&includeChildren`);
  }

  delete(identifier:string):Observable<any> {
    return this.http.delete(`${this.apiUrl}records/delete/${identifier}`);
  }
}
