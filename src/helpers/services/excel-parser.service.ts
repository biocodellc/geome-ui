import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Observable, from } from 'rxjs';
import _ from 'lodash';

const EXTS = ['xls', 'xlsx', 'xlsm', 'xlsb', 'ods'];

@Injectable({
  providedIn: 'root'
})
export class ExcelParserService {

  constructor() {}

  private workbookFromFile(file: File, opts: any = {}): Observable<XLSX.WorkBook> {
    return new Observable(observer => {
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'array', ...opts });
          observer.next(workbook);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };

      reader.onerror = error => observer.error(error);
      reader.readAsArrayBuffer(file);
    });
  }

  private parseSheet(sheet: XLSX.WorkSheet, readCells: boolean) {
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
    const sheetData: any[] = [];

    if (readCells) {
      _.forEachRight(_.range(range.s.r, range.e.r + 1), (row:any) => {
        const rowData: any[] = [];
        _.forEachRight(_.range(range.s.c, range.e.c + 1), (column:any) => {
          const cellIndex = XLSX.utils.encode_cell({ c: column, r: row });
          const cell = sheet[cellIndex];
          rowData[column] = cell ? cell.v : undefined;
        });
        sheetData[row] = rowData;
      });
    }

    return {
      data: sheetData,
      name: sheet['name'],
      col_size: range.e.c + 1,
      row_size: range.e.r + 1,
    };
  }

  isExcelFile(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension ? EXTS.includes(extension) : false;
  }

  workbookToJson(file: File, opts?: any): Observable<any> {
    if (this.isExcelFile(file)) {
      return new Observable(observer => {
        this.workbookFromFile(file, opts).subscribe({
          next: (workbook: XLSX.WorkBook) => {
            const result: any = { isExcel: true };
            workbook.SheetNames.forEach((sheetName:string) => {
              const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
              if (roa.length > 0) {
                result[sheetName] = roa;
              }
            });
            observer.next(result);
            observer.complete();
          },
          error: err => observer.error(err)
        });
      });
    }

    return new Observable(observer => {
      Papa.parse(file, {
        header: true,
        complete: (results:any) => {
          if (results.meta.aborted) {
            observer.error(results.errors);
          } else {
            observer.next({ isExcel: false, default: results.data });
            observer.complete();
          }
        }
      });
    });
  }

  parseWorkbookSheetNames(file: File): Observable<string[]> {
    return new Observable(observer => {
      this.workbookFromFile(file, { bookSheets: true }).subscribe({
        next: workbook => {
          observer.next(workbook.SheetNames);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  findExcelCell(file: File, regEx: RegExp, sheetName: string): Observable<string | undefined> {
    return new Observable(observer => {
      this.parseWorkbookSheetNames(file).subscribe({
        next: sheetNames => {
          if (!sheetNames.includes(sheetName)) {
            observer.next(undefined);
            observer.complete();
            return;
          }

          this.workbookFromFile(file).subscribe({
            next: workbook => {
              const sheet = workbook.Sheets[sheetName];

              if (!sheet || Object.keys(sheet).length === 0) {
                observer.error(new Error(`Workbook doesn't contain sheet: ${sheetName}`));
                return;
              }

              const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
              let match: string | undefined;

              for (let row = range.s.r; row <= range.e.r; row++) {
                for (let column = range.s.c; column <= range.e.c; column++) {
                  const cellIndex = XLSX.utils.encode_cell({ c: column, r: row });
                  const cell = sheet[cellIndex];

                  if (cell && regEx.test(cell.v)) {
                    match = cell.v;
                    observer.next(match);
                    observer.complete();
                    return;
                  }
                }
              }

              observer.next(match);
              observer.complete();
            },
            error: err => observer.error(err)
          });
        },
        error: err => observer.error(err)
      });
    });
  }

  parseWorkbook(file: File, readCells: boolean): Observable<any> {
    return new Observable(observer => {
      this.workbookFromFile(file).subscribe({
        next: workbook => {
          const sheets: any = {};
          workbook.SheetNames.forEach((sheetName:string) => {
            const sheet = workbook.Sheets[sheetName];
            if (sheet && Object.keys(sheet).length > 0) {
              sheets[sheetName] = this.parseSheet(sheet, readCells);
            }
          });
          observer.next(sheets);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  parseWorkbookWithHeaders(file: File): Observable<XLSX.WorkBook> {
    return new Observable(observer => {
      this.workbookFromFile(file, { sheetRows: 1 }).subscribe({
        next: workbook => {
          workbook.SheetNames.forEach((sheetName:string) => {
            const sheet = workbook.Sheets[sheetName];

            if (sheet && Object.keys(sheet).length > 0) {
              sheet['headers'] = [];
              const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');

              const sheetRange = sheet['!fullref'] || sheet['!ref'];
              const match = /:[a-zA-Z]+(\d+)/.exec(sheetRange);
              sheet['rowCount'] = match ? parseInt(match[1], 10) : 0;

              for (let row = range.s.r; row <= range.e.r; row++) {
                for (let column = range.s.c; column <= range.e.c; column++) {
                  const cellIndex = XLSX.utils.encode_cell({ c: column, r: row });
                  const cell = sheet[cellIndex];

                  if (cell) sheet['headers'].push(cell.v);
                }
              }
            }
          });

          observer.next(workbook);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }
}
