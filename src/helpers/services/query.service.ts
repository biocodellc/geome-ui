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
        if (!response?.url) {
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

  transformResults(data: any, entity: string): any[] {
    if (!data || Object.keys(data).length === 0) return [];
  
    const buildRecordMap = (alias: string, key: string): Record<string, any> | undefined =>
      data[alias]?.reduce((map: Record<string, any>, item: any) => {
        map[item[key]] = item;
        return map;
      }, {});
  
    const records: any[] = [];
    const events = buildRecordMap('Event', 'eventID');
    const samples = buildRecordMap('Sample', 'materialSampleID');
    const tissues = buildRecordMap('Tissue', 'tissueID');
  
    const assignCommon = (record: any, sample?: any, event?: any, extra?: any) => {
      const bcid = record.bcid;
      const sampleBcid = sample?.bcid;
      const eventBcid = event?.bcid;
      Object.assign(record, sample, event, extra, { bcid, sampleBcid, eventBcid });
      return record;
    };
  
    switch (entity) {
      case 'Diagnostics':
        data.Diagnostics?.forEach((d:any) => {
          const sample = samples?.[d.materialSampleID];
          const event = events?.[sample?.eventID];
          records.push(assignCommon(d, sample, event, { sampleBcid: sample?.bcid }));
        });
        break;
  
      case 'fastqMetadata':
        data.fastqMetadata?.forEach((f:any) => {
          const tissue = tissues?.[f.tissueID];
          const sample = samples?.[tissue?.materialSampleID];
          const event = events?.[sample?.eventID];
          records.push(assignCommon(f, sample, event, {
            tissueBcid: tissue?.bcid,
            sampleBcid: sample?.bcid,
          }));
        });
        break;
  
      case 'Sample_Photo':
      case 'Tissue':
        const source = data[entity];
        source?.forEach((item:any) => {
          const sample = samples?.[item.materialSampleID];
          const event = events?.[sample?.eventID];
          records.push(assignCommon(item, sample, event));
        });
        break;
  
      case 'Event_Photo':
        data.Event_Photo?.forEach((s:any) => {
          const event = events?.[s.eventID];
          records.push(assignCommon(s, undefined, event));
        });
        break;
  
      case 'Sample':
        data.Sample?.forEach((s:any) => {
          const event = events?.[s.eventID];
          records.push(assignCommon(s, undefined, event));
        });
        break;
  
      case 'Event':
        data.Event?.forEach((e:any) => records.push(e));
        break;
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
    if(this.q && !q.includes('_select_')) this.q += `and ${q} `;
    else this.q += `${q} `
  }

  setSource(source:any) {
    if(source) this.source = source;
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