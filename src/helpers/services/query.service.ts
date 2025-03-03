import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FileService } from './file.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private restRoot = environment.restRoot;

  private http = inject(HttpClient);
  private fileService = inject(FileService);
  private toastr = inject(ToastrService);

  queryJson(query: any, entity: string, page: number, limit: number, warnOnLimit = true): Observable<any> {
    const params = new HttpParams({ fromObject: { ...query, page, limit } });

    return this.http.get<{ content: any[], page: number }>(`${this.restRoot}records/${entity}/json`, { params }).pipe(
      map(response => {
        const results = {
          page: response.page || 0,
          totalElements: response.content?.length || 0,
          data: this.transformResults(response.content, entity)
        };

        if (results.data.length === 0) {
          this.toastr.warning('No results found.');
        }

        if (warnOnLimit && results.totalElements === limit) {
          this.toastr.warning(`Query results are limited to ${limit}. Narrow your search or download results for more.`);
        }

        return results;
      }),
      catchError(error => {
        this.toastr.error('Failed to fetch data.');
        throw error;
      })
    );
  }

  downloadFile(format: string, query: any, entity: string): void {
    const params = new HttpParams({ fromObject: query });
    this.http.get<{ url: string }>(`${this.restRoot}records/${entity}/${format}`, { params }).pipe(
      map(response => {
        if (!response.url) {
          this.toastr.warning('No results found.');
          return;
        }
        this.fileService.download(response.url);
      }),
      catchError(error => {
        this.toastr.error('Failed downloading file!');
        throw error;
      })
    ).subscribe();
  }

  private transformResults(data: any, entity: string): any[] {
    if (!data || Object.keys(data).length === 0) return [];
    
    const records: any[] = [];
    const getRecords = (alias: string, uniqueKey: string) =>
      data[alias]?.reduce((acc: any, record: any) => {
        acc[record[uniqueKey]] = record;
        return acc;
      }, {}) || {};

    const events = getRecords('Event', 'eventID');
    const samples = getRecords('Sample', 'materialSampleID');
    const tissues = getRecords('Tissue', 'tissueID');

    if (entity === 'Diagnostics') {
      data.Diagnostics.forEach((d:any) => {
        const record = { ...d, bcid: d.bcid };
        if (samples[d.materialSampleID]) {
          Object.assign(record, samples[d.materialSampleID], { sampleBcid: samples[d.materialSampleID].bcid });
        }
        if (events[record.eventID]) {
          Object.assign(record, events[record.eventID], { eventBcid: events[record.eventID].bcid });
        }
        records.push(record);
      });
    } else if (entity === 'Sample') {
      data.Sample.forEach((s:any) => {
        const record = { ...s, bcid: s.bcid };
        if (events[s.eventID]) {
          Object.assign(record, events[s.eventID], { eventBcid: events[s.eventID].bcid });
        }
        records.push(record);
      });
    } else if (entity === 'Event') {
      records.push(...data.Event);
    }
    return records;
  }

  downloadExcel(query:any, entity:string) {
    return this.downloadFile('excel', query, entity);
  }

  downloadKml(query:any, entity:string) {
    return this.downloadFile('kml', query, entity);
  }

  downloadCsv(query:any, entity:string) {
    return this.downloadFile('csv', query, entity);
  }

  downloadFasta(query:any, entity:string) {
    return this.downloadFile('fasta', query, entity);
  }

  downloadFastq(query:any, entity:string) {
    return this.downloadFile('fastq', query, entity);
  }
}


export class QueryBuilder {
  q:string = '';
  source:any = [];

  add(q:string) {
    this.q += `${q} `;
  }

  setSource(source:any) {
    this.source = source;
  }

  build() {
    if (this.q.trim().length === 0) {
      this.q = '*';
    }
    return new Query(this.q, this.source);
  }
}

export class Query {
  q:string = '';
  source:Array<any> = [];
  networkId:number = 1; // GEOME Network

  constructor(queryString:string, source:any) {
    this.q = queryString;
    this.source = source;
  }
}