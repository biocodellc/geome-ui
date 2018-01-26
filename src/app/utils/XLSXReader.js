import xlsx from 'xlsx/dist/xlsx.core.min';
import _ from 'lodash';

export default class XLSXReader {
  // Supported Extensions
  static exts = ['xls', 'xlsx', 'xlsxm', 'xlsb', 'ods'];

  intializeFromFile(obj, file, readCells, toJSON, handler) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = xlsx.read(data, {
        type: 'binary'
      });

      obj.sheets = this.parseWorkbook(workbook, readCells, toJSON);
      handler(obj);
    };

    reader.readAsBinaryString(file);
  }

  parseWorkbook(workbook, readCells, toJSON) {
    if (toJSON === true) {
      return this.to_json(workbook);
    }

    const sheets = {};

    workbook.SheetNames.forEach(sName => {
      const s = workbook.sheets[s];

      if (s && Object.keys(s).length > 0) {
        sheets[sName] = this.parseSheet(s, readCells);
      }
    });

    return sheets;
  }

  parseSheet(sheet, readCells) {
    const range = xlsx.utils.decode_range(sheet['!ref']);
    const sheetData = [];

    if (readCells === true) {
      _.forEachRight(_.range(range.s.r, range.e.r + 1), (row) => {
        const rowData = [];
        _.forEachRight(_.range(range.s.c, range.e.c + 1), (column) => {
          const cellIndex = xlsx.utils.encode_cell({
            'c': column,
            'r': row
          });
          const cell = sheet[cellIndex];
          rowData[column] = cell ? cell.v : undefined;
        });
        sheetData[row] = rowData;
      });
    }

    return {
      'data': sheetData,
      'name': sheet.name,
      'col_size': range.e.c + 1,
      'row_size': range.e.r + 1
    }
  }

  to_json(workbook) {
    const result = {};
    workbook.SheetNames.forEach((sheetName) => {
      const roa = xlsx.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
      if (roa.length > 0) {
        result[sheetName] = roa;
      }
    });
    return result;
  }

  findCell(file, regEx, sheetName) {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const data = e.target.result;
        const workbook = xlsx.read(data, {
          type: 'binary'
        });

        const sheet = workbook.Sheets[ sheetName ];

        if (!sheet || Object.keys(sheet).length === 0) {
          console.log("Workbook doesn't contain sheet: " + sheetName);
          return resolve(null);
        }

        const range = xlsx.utils.decode_range(sheet[ '!ref' ]);
        let match;
        _.range(range.s.r, range.e.r + 1).some((row) => {
          _.range(range.s.c, range.e.c + 1).some((column) => {
            const cellIndex = xlsx.utils.encode_cell({
              'c': column,
              'r': row
            });

            const cell = sheet[ cellIndex ];

            if (cell && cell.v.match(regEx)) {
              match = cell.v;
              return true;
            }
          });
          if (match) {
            return true;
          }
        });

        resolve(match);
      };

      reader.readAsBinaryString(file);
    })
  }
}
