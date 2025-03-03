import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  // Injector
  private http = inject(HttpClient);
  private restRoot = environment.restRoot;

  get(identifier:string, httpOpts:any) {
    const re = new RegExp(/^ark:\/\d{5}\/[A-Za-z]+2$/);
    const path = re.exec(identifier) ? 'bcids/metadata/' : 'records/';

    return this.http.get(`${this.restRoot}${path}${identifier}?includeParent&includeChildren`, { ...httpOpts });
  }

  delete(identifier:string) {
    return this.http.delete(`${this.restRoot}records/delete/${identifier}`);
  }
}
