import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Injectors
  private http = inject(HttpClient);

  private apiUrl:string = environment.restRoot;

  upload(uploadId:number):Observable<any>{
    return this.http.put(`${this.apiUrl}data/upload/${uploadId}`,'');
  }

  exportData(projectId:number, expeditionCode:string):Observable<any> {
    return this.http.get(`${this.apiUrl}data/export/${projectId}/${expeditionCode}`)
      // .then(response => {
      //   if (response.status === 204) {
      //     angular.toaster('No resources found');
      //     return Promise.resolve();
      //   }
      //   return this.FileService.download(response.data.url);
      // })
      // .catch(angular.catcher('Failed to export data'));
  }

  generateSraData(projectId:number, expeditionCode:string):Observable<any> {
    return this.http.get(`${this.apiUrl}sra/submissionData?projectId=${projectId}&expeditionCode=${expeditionCode}&format=file`)
      // .then(response => {
      //   if (response.status === 204) {
      //     angular.toaster('No Fastq records found.');
      //     return Promise.resolve();
      //   }
      //   return this.FileService.download(response.data.url);
      // })
      // .catch(angular.catcher('Failed to generate SRA files'));
  }

  fetchSraData(projectId:number, expeditionCode:string):Observable<any> {
    return this.http.get(`${this.apiUrl}sra/submissionData?projectId=${projectId}&expeditionCode=${expeditionCode}&format=json`);
      // .then(response => response.data)
      // .catch(angular.catcher('Failed to fetch SRA data'));
  }
}
