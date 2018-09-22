import Papa from 'papaparse';
import { utils } from 'xlsx';
import _ from 'lodash';

import Worker from './xlsx.worker';

const EXTS = ['xls', 'xlsx', 'xlsxm', 'xlsb', 'ods'];

const workbookFromFile = (file, opts = {}) => {
  let xlsx;
  const p = new Promise((resolve, reject) => {
    if (typeof Worker === 'undefined') {
      reject(
        new Error("Browser doesn't support web workers. Not parsing workbook"),
      );
      return;
    }

    xlsx = new Worker();
    xlsx.onmessage = event => {
      resolve(event.data);
      xlsx.terminate();
    };
    xlsx.onerror = event => {
      console.log(event);
      reject(event.message);
      xlsx.terminate();
    };

    xlsx.postMessage({
      file,
      opts: Object.assign(
        {
          cellFormula: false,
          cellHtml: false,
          cellText: false,
        },
        opts,
      ),
    });
  });

  // allow promise to be canceled
  p.cancel = () => xlsx && xlsx.terminate();

  return p;
};

const parseSheet = (sheet, readCells) => {
  const range = utils.decode_range(sheet['!ref']);
  const sheetData = [];

  if (readCells === true) {
    _.forEachRight(_.range(range.s.r, range.e.r + 1), row => {
      const rowData = [];
      _.forEachRight(_.range(range.s.c, range.e.c + 1), column => {
        const cellIndex = utils.encode_cell({
          c: column,
          r: row,
        });
        const cell = sheet[cellIndex];
        rowData[column] = cell ? cell.v : undefined;
      });
      sheetData[row] = rowData;
    });
  }

  return {
    data: sheetData,
    name: sheet.name,
    col_size: range.e.c + 1,
    row_size: range.e.r + 1,
  };
};

export const isExcelFile = file => {
  const splitFileName = file.name.split('.');
  return EXTS.includes(splitFileName.pop());
};

export const workbookToJson = (file, opts) => {
  if (isExcelFile(file)) {
    return workbookFromFile(file, opts).then(workbook => {
      const result = {
        isExcel: true,
      };
      workbook.SheetNames.forEach(sheetName => {
        const roa = utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if (roa.length > 0) {
          result[sheetName] = roa;
        }
      });
      return result;
    });
  }
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: results => {
        if (results.meta.aborted) {
          reject(results.errors);
          return;
        }

        resolve(Object.assign({ isExcel: false, default: results.data }));
      },
    });
  });
};

export const parseWorkbookSheetNames = file =>
  workbookFromFile(file, { bookSheets: true }).then(wb => wb.SheetNames);

export const findExcelCell = (file, regEx, sheetName) =>
  parseWorkbookSheetNames(file).then(sheetNames => {
    if (!sheetNames.includes(sheetName)) {
      console.log(`Workbook doesn't contain sheet: ${sheetName}`);
      return undefined;
    }
    return workbookFromFile(file).then(workbook => {
      const sheet = workbook.Sheets[sheetName];

      if (!sheet || Object.keys(sheet).length === 0) {
        throw new Error(`Workbook doesn't contain sheet: ${sheetName}`);
      }

      const range = utils.decode_range(sheet['!ref']);
      let match;
      _.range(range.s.r, range.e.r + 1).some(row => {
        _.range(range.s.c, range.e.c + 1).some(column => {
          const cellIndex = utils.encode_cell({
            c: column,
            r: row,
          });

          const cell = sheet[cellIndex];

          if (cell && cell.v.match(regEx)) {
            match = cell.v;
            return true;
          }
        });
        if (match) {
          return true;
        }
      });

      return match;
    });
  });

export const parseWorkbook = (file, readCells) =>
  workbookFromFile(file).then(workbook => {
    const sheets = {};

    workbook.SheetNames.forEach(sName => {
      const s = workbook.Sheets[sName];

      if (s && Object.keys(s).length > 0) {
        sheets[sName] = parseSheet(s, readCells);
      }
    });

    return sheets;
  });

export const parseWorkbookWithHeaders = file =>
  workbookFromFile(file, { sheetRows: 1 }).then(workbook => {
    workbook.SheetNames.forEach(sName => {
      const s = workbook.Sheets[sName];

      if (s && Object.keys(s).length > 0) {
        s.headers = [];
        const range = utils.decode_range(s['!ref']);

        // range looks like A1:AA35
        const sheetRange = s['!fullref'] || s['!ref'];
        const match = new RegExp(/:[a-zA-Z]+(\d+)/).exec(sheetRange);
        s.rowCount = match ? parseInt(match[1], 10) : 0;

        _.range(range.s.r, range.e.r + 1).forEach(row => {
          _.range(range.s.c, range.e.c + 1).forEach(column => {
            const cellIndex = utils.encode_cell({
              c: column,
              r: row,
            });

            const cell = s[cellIndex];

            if (cell) s.headers.push(cell.v);
          });
        });
      }
    });

    return workbook;
  });
