import Papa from 'papaparse';
import xlsx from 'xlsx';
import _ from 'lodash';

const EXTS = ['xls', 'xlsx', 'xlsxm', 'xlsb', 'ods'];

const workbookFromFile = file =>
  new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = e => {
        const data = e.target.result;
        try {
          const workbook = xlsx.read(data, {
            type: 'binary',
          });
          resolve(workbook);
        } catch (err) {
          reject(err);
        }
      };

      reader.readAsBinaryString(file);
    } catch (e) {
      reject(e);
    }
  });

const parseSheet = (sheet, readCells) => {
  const range = xlsx.utils.decode_range(sheet['!ref']);
  const sheetData = [];

  if (readCells === true) {
    _.forEachRight(_.range(range.s.r, range.e.r + 1), row => {
      const rowData = [];
      _.forEachRight(_.range(range.s.c, range.e.c + 1), column => {
        const cellIndex = xlsx.utils.encode_cell({
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

export const workbookToJson = file => {
  if (isExcelFile(file)) {
    return workbookFromFile(file).then(workbook => {
      const result = {
        isExcel: true,
      };
      workbook.SheetNames.forEach(sheetName => {
        const roa = xlsx.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName],
        );
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

export const findExcelCell = (file, regEx, sheetName) =>
  workbookFromFile(file).then(workbook => {
    const sheet = workbook.Sheets[sheetName];

    if (!sheet || Object.keys(sheet).length === 0) {
      throw new Error(`Workbook doesn't contain sheet: ${sheetName}`);
    }

    const range = xlsx.utils.decode_range(sheet['!ref']);
    let match;
    _.range(range.s.r, range.e.r + 1).some(row => {
      _.range(range.s.c, range.e.c + 1).some(column => {
        const cellIndex = xlsx.utils.encode_cell({
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

export const parseWorkbook = (file, readCells) =>
  workbookFromFile(file).then(workbook => {
    const sheets = {};

    workbook.SheetNames.forEach(sName => {
      const s = workbook.sheets[sName];

      if (s && Object.keys(s).length > 0) {
        sheets[sName] = parseSheet(s, readCells);
      }
    });

    return sheets;
  });
