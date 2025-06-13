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
    return this.http.post(`${this.apiUrl}data/validate?waitForCompletion=false`, this.formatUploadData(data));
  }

  validationStatus(id:number) {
    let interval:any;
    let hitCount:number = 0;
    const emitter = new EventEmitter();

    const poll = () =>
      this.http.get(`${this.apiUrl}data/validate/${id}`).subscribe({
        next: (res:any) => {
          if (res.isValid || res.isValid == false) {
            emitter.emit({ result: res });
            clearInterval(interval);
          } else emitter.emit({ status: res.status });
        },
        error: (err:any) =>{
          clearInterval(interval)
          emitter.emit({ status: 'Failed' });
        }
      });

    poll();
    interval = setInterval(() =>{
      if(hitCount > 10){
        clearInterval(interval);
        emitter.emit({ status: 'In Progress' });
      }
      poll();
      hitCount++;
    }, 2000);
    return emitter;
  }

  // Uploads

  upload(uploadId:number):Observable<any>{
    return this.http.put(`${this.apiUrl}data/upload/${uploadId}`, '');
  }

  exportData(projectId:number, expeditionCode:string):Observable<any> {
    return this.http.get(`${this.apiUrl}data/export/${projectId}/${expeditionCode}`);
  }

  generateSraData(projectId:number, expeditionCode:string):string {
    return `${this.apiUrl}sra/submissionData?projectId=${projectId}&expeditionCode=${expeditionCode}&format=file`;
  }

  fetchSraData(projectId:number, expeditionCode:string):Observable<any> {
    return this.http.get(`${this.apiUrl}sra/submissionData?projectId=${projectId}&expeditionCode=${expeditionCode}&format=json`);
  }

  private formatUploadData(data:uploadData):FormData{
    const formData = new FormData();
    const allKeys = Object.keys(data) as (keyof uploadData)[];
    allKeys.forEach(key=>{
      if(key === 'workbooks' || key === 'dataSourceFiles'){
        data[key].forEach((file:File) => formData.append(key, file));
      }
      else if(key === 'dataSourceMetadata' && data.dataSourceMetadata){
        const val = new Blob([JSON.stringify(data.dataSourceMetadata)], {
          type: 'application/json'
        });
        formData.append(key, val)
      }
      else if(key !== 'expeditionCode')
        formData.append(key, JSON.stringify(data[key]));
      else formData.append(key, data[key]);
    })
    return formData;
  }
}


interface uploadData{
  "upload": boolean,
  "reloadWorkbooks": boolean,
  "dataSourceMetadata": any[] | Blob,
  "dataSourceFiles": File[],
  "expeditionCode": string,
  "workbooks": File[],
  "projectId": number | undefined
}