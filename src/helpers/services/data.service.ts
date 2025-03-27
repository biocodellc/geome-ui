import { HttpClient } from '@angular/common/http';
import { EventEmitter, inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Injectors
  private http = inject(HttpClient);
  private apiUrl:string = environment.restRoot;

  // Validations
  validate(data:any) {
    // if (data?.dataSourceMetadata) {
    //   data.dataSourceMetadata = this.Upload.jsonBlob(data.dataSourceMetadata);
    // }
    // return this.Upload.upload({
    //   url: `${this.apiUrl}data/validate?waitForCompletion=false`,
    //   data,
    //   arrayKey: '',
    // })
  }

  validationStatus(id:number) {
    let interval:any;
    const emitter = new EventEmitter();

    const poll = () =>
      this.http.get(`${this.apiUrl}data/validate/${id}`).subscribe(({ data }:any) => {
        if ('isValid' in data) {
          emitter.emit({ result: data });
          clearInterval(interval);
        } else emitter.emit({ status: data.status });
      });

    poll();
    interval = setInterval(() => poll(), 1000);
    return emitter;
  }

  // Uploads

  upload(uploadId:number):Observable<any>{
    return this.http.put(`${this.apiUrl}data/upload/${uploadId}`,'');
  }

  exportData(projectId:number, expeditionCode:string):Observable<any> {
    return this.http.get(`${this.apiUrl}data/export/${projectId}/${expeditionCode}`);
  }

  generateSraData(projectId:number, expeditionCode:string):Observable<any> {
    return this.http.get(`${this.apiUrl}sra/submissionData?projectId=${projectId}&expeditionCode=${expeditionCode}&format=file`);
  }

  fetchSraData(projectId:number, expeditionCode:string):Observable<any> {
    return this.http.get(`${this.apiUrl}sra/submissionData?projectId=${projectId}&expeditionCode=${expeditionCode}&format=json`);
  }
}
