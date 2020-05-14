import angular from 'angular';
import {
  findExcelCell,
  isExcelFile,
  parseWorkbookWithHeaders,
  workbookToJson,
} from '../../../utils/tabReader';
import appConfig from '../../../utils/config';
import CreateExpeditionController, {
  createExpeditionTemplate,
} from '../../../components/expeditions/CreateExpeditionController';

const { naan } = appConfig;
const template = require('./upload.html');

const MULTI_EXPEDITION = 'MULTI_EXPEDITION';
const EXCEL_MAX_ROWS_TO_PARSE = 10000;

const LAT_URI = 'urn:decimalLatitude';
const LNG_URI = 'urn:decimalLongitude';

const defaultFastqMetadata = {
  libraryLayout: null,
  libraryStrategy: null,
  librarySource: null,
  librarySelection: null,
  platform: null,
  designDescription: null,
  instrumentModel: null,
};

const parseSpreadsheet = (regExpression, sheetName, file) => {
  if (isExcelFile(file)) {
    return findExcelCell(file, regExpression, sheetName).then(match =>
      match
        ? match
            .toString()
            .split('=')[1]
            .slice(0, -1)
        : match,
    );
  }

  return Promise.resolve();
};

class UploadController {
  constructor($scope, $uibModal, $mdDialog) {
    'ngInject';

    this.$scope = $scope;
    this.$uibModal = $uibModal;
    this.$mdDialog = $mdDialog;
  }

  $onInit() {
    this.fastaData = [];
    this.worksheetData = [];
    this.availableDataTypes = this.getAvailableDataTypes();
    this.fastqMetadata = Object.assign({}, defaultFastqMetadata);
    this.dataTypes = {};
    this.expeditionCode = undefined;
    this.coordinateWorksheets = [];
    this.verifiedCoordinateWorksheets = [];
    this.verifySampleLocations = false;
    this.sampleLocationsVerified = false;
    this.multiExpeditionAllowed = true;
    this.showExpeditions = false;
    this.requireExpedition =
      this.currentProject.config.worksheets().length !== 1;
    this.parsing = false;
  }

  $onChanges(changesObj) {
    if ('currentUser' in changesObj) {
      this.validateOnly = !this.currentUser;
    }

    if (this.currentProject && 'currentProject' in changesObj) {
      this.availableDataTypes = this.getAvailableDataTypes();
      this.requireExpedition =
        this.currentProject.config.worksheets().length !== 1;
    }
  }

  handleDatatypes(dataTypes) {
    if (!dataTypes.Fastq) {
      this.fastqMetadata = Object.assign({}, defaultFastqMetadata);
    }

    const worksheets = Object.keys(dataTypes).filter(
      d => dataTypes[d] && d !== 'Fasta' && d !== 'Fastq',
    );

    // remove any worksheetData objects that aren't in the dataTypes
    this.worksheetData = this.worksheetData.filter(d =>
      worksheets.includes(d.worksheet),
    );
    // add any missing worksheetData objects
    worksheets.forEach(w => {
      if (this.worksheetData.find(d => d.worksheet === w)) return;
      this.worksheetData.push({
        worksheet: w,
        file: undefined,
        reload: false,
      });
    });

    this.dataTypes = Object.assign({}, dataTypes);
    this.multiExpeditionAllowed = !(dataTypes.Fastq || dataTypes.Fasta);

    if (!this.showExpeditions && (dataTypes.Fasta || dataTypes.Fastq)) {
      this.showExpeditions = true;
    }

    if (
      !this.multiExpeditionAllowed &&
      this.expeditionCode === MULTI_EXPEDITION
    ) {
      this.expeditionCode = undefined;
      angular.toaster.error(
        'Multi expedition uploads are not supported for Fasta or Fastq dataTypes',
        { hideDelay: 5000 },
      );
    }
  }

  handleExpeditionChange(expeditionCode) {
    if (expeditionCode === 'CREATE') {
      this.$mdDialog
        .show({
          template: createExpeditionTemplate,
          locals: {
            metadataProperties: this.currentProject.config
              .expeditionMetadataProperties,
            projectId: this.currentProject.projectId,
            // $mdDialog: this.$mdDialog,
          },
          bindToController: true,
          controller: CreateExpeditionController,
          controllerAs: '$ctrl',
          autoWrap: false,
        })
        .then(expedition => {
          this.userExpeditions = this.userExpeditions.concat([expedition]);
          this.expeditionCode = expedition.expeditionCode;
        })
        // .catch(() => {});
        // this.$uibModal
        //   .open({
        //     component: 'fimsCreateExpeditionModal',
        //     size: 'md',
        //     windowClass: 'app-modal-window',
        //     backdrop: 'static',
        //     resolve: {
        //       // metadataProperties: () =>
        //       // ,
        //       // projectId: () => this.currentProject.projectId,
        //     },
        //   })
        // .result.then(expedition => {
        // this.userExpeditions = this.userExpeditions.concat([expedition]);
        // this.expeditionCode = expedition.expeditionCode;
        // })
        .catch(() => {
          this.expeditionCode = undefined;
        });
    }
    this.expeditionCode = expeditionCode;
  }

  handleWorksheetDataChange(worksheet, file, reload) {
    let data = this.worksheetData.find(d => d.worksheet === worksheet);

    const fileChanged = (!data && file) || data.file !== file;
    if (data) {
      data.file = file;
      data.reload = reload;
    } else {
      data = { worksheet, file, reload };
      this.worksheetData.push(data);
    }

    if (fileChanged && file) {
      this.parsing = true;
      if (worksheet === 'Workbook') {
        parseSpreadsheet('~naan=[0-9]+~', 'Instructions', file).then(n => {
          if (naan && n && n > 0 && Number(n) !== Number(naan)) {
            this.$mdDialog
              .show(
                this.$mdDialog
                  .alert('naanDialog')
                  .clickOutsideToClose(true)
                  .title('Incorrect NAAN')
                  .htmlContent(
                    `Spreadsheet appears to have been created using a different FIMS/BCID system.
                   <br/>
                   <br/>
                   Spreadsheet says <strong>NAAN = ${n}</strong>
                   <br/>
                   System says <strong>NAAN = ${naan}</strong>
                   <br/>
                   <br/>
                   Proceed only if you are SURE that this spreadsheet is being called.
                   Otherwise, re-load the proper FIMS system or re-generate your spreadsheet template.`,
                  )
                  .ok('Proceed Anyways'),
              )
              .then(() => this.handleNewWorksheet(data));
          } else {
            this.handleNewWorksheet(data);
          }
        });
      } else {
        this.handleNewWorksheet(data);
      }
    } else if (!file) {
      const i = this.coordinateWorksheets.findIndex(v => v === worksheet);
      if (i > -1) {
        this.coordinateWorksheets.splice(i, 1);
      }
    }
  }

  canValidate() {
    return (
      !this.parsing &&
      (this.worksheetData.some(d => d.file) ||
        this.fastaData.some(d => d.file) ||
        this.fastqMetadata.file) &&
      (!this.requireExpedition || this.expeditionCode) &&
      (!this.currentUser || this.validateOnly || this.expeditionCode)
    );
  }

  /**
   * Attempt to parse the expeditionCodes & verify coordinates if present
   *
   * If we find a single expeditionCode, we can set the expeditionCode. If we find multiple
   * expeditionCodes, set the expeditionCode to multiple.
   *
   * If we find coordinates, ask the user to verify the coordinates
   *
   * @param {object} worksheetData this.worksheetData object
   */
  async handleNewWorksheet({ worksheet, file }) {
    const expeditionCodes = new Set();

    const updateView = (timedOut = false, parsedEntireBook = false) => {
      this.parsing = false;
      if (timedOut && this.expeditionCode) return;

      if (expeditionCodes.size === 1) {
        const expeditionCode = expeditionCodes.values().next().value;
        if (
          this.userExpeditions.some(e => e.expeditionCode === expeditionCode)
        ) {
          this.expeditionCode = expeditionCode;
        }
      } else if (expeditionCodes.size > 1) {
        if (this.multiExpeditionAllowed) {
          this.expeditionCode = MULTI_EXPEDITION;
        }
      } else if (parsedEntireBook) {
        this.multiExpeditionAllowed = false;
      }
      this.$scope.$apply(() => {
        this.showExpeditions = true;
      });
    };

    if (worksheet === 'Workbook') {
      // if may take a while to parse an excel workbook, so set a timeout
      let timedOut = false;

      const parseWorkbook = async () => {
        const wb = await parseWorkbookWithHeaders(file);
        let rowCount = 0;
        let fullWorkbookPromise;
        let hasCoordinateWorksheet = false;
        const worksheets = [];

        wb.SheetNames.forEach(s => {
          if (this.setCoordinateWorksheet(s)) {
            hasCoordinateWorksheet = true;
          }
          if (this.currentProject.config.worksheets().includes(s)) {
            worksheets.push(s);
          }
          rowCount += wb.Sheets[s].rowCount;
        });

        // xlsx parser is too slow to parse workbooks w/ > 10k rows
        // If we want to do this, we should for the xlsx-js lib and
        // add the ability to parse only specific sheets & rows
        // current behavior is to parse the entire wb
        if (hasCoordinateWorksheet && rowCount <= EXCEL_MAX_ROWS_TO_PARSE) {
          if (!fullWorkbookPromise) {
            fullWorkbookPromise = workbookToJson(file);
          }
          fullWorkbookPromise.then(fullWorkbook => {
            // if the file has been changed, don't ask to upload
            if (
              timedOut &&
              (this.uploading || !this.worksheetData.some(d => d.file))
            ) {
              return fullWorkbook;
            }
            this.verifyCoordinates(worksheet, fullWorkbook);
            this.coordinateWorksheets.push('Workbook');
            return fullWorkbook;
          });
        }

        let parsedEntireBook = true;

        // parse expeditionCodes
        if (worksheets.length > 0) {
          const hasExpeditionCode = worksheets.find(s =>
            wb.Sheets[s].headers.includes('expeditionCode'),
          );

          if (hasExpeditionCode) {
            if (!fullWorkbookPromise) {
              parsedEntireBook = rowCount <= EXCEL_MAX_ROWS_TO_PARSE;
              const opts =
                rowCount <= EXCEL_MAX_ROWS_TO_PARSE
                  ? {}
                  : {
                      sheetRows: Math.floor(
                        EXCEL_MAX_ROWS_TO_PARSE / worksheets.length,
                      ),
                    };
              fullWorkbookPromise = workbookToJson(file, opts);
            }
            const fullWorkbook = await fullWorkbookPromise;
            // if the file has been changed, don't ask to upload
            if (
              timedOut &&
              (this.uploading || !this.worksheetData.some(d => d.file))
            ) {
              return undefined;
            }

            worksheets.forEach(s => {
              const records = fullWorkbook[s];

              if (records.length && 'expeditionCode' in records[0]) {
                records.forEach(
                  record =>
                    record.expeditionCode &&
                    expeditionCodes.add(record.expeditionCode),
                );
              }
            });

            return parsedEntireBook;
          }
        } else {
          angular.toaster.error(
            `Failed to find one of the following worksheets: ${this.currentProject.config
              .worksheets()
              .join(', ')}`,
            { hideDelay: 5000 },
          );
        }
      };

      const t = setTimeout(() => {
        timedOut = true;
        angular.toaster.error(
          'Timed out attempting to parse Workbook for coordinate verification. You can still validate/upload your data. If there are many rows in your workbook, it will be faster to upload a csv file.',
          { hideDelay: 5000 },
        );
        updateView();
      }, 2000);

      parseWorkbook().then(parsedEntireBook => {
        if (!timedOut) {
          clearTimeout(t);
        }
        updateView(timedOut, parsedEntireBook);
      });
    } else {
      const workbook = await workbookToJson(file);

      if (this.setCoordinateWorksheet(worksheet)) {
        this.verifyCoordinates(worksheet, workbook);
        this.coordinateWorksheets.push(worksheet);
      }

      // parse expeditionCodes
      const sheet = workbook.default;
      sheet
        .map(record => record.expeditionCode)
        .filter(e => e)
        .forEach(e => expeditionCodes.add(e));

      updateView();
    }
  }

  handleFastaDataChange(data) {
    this.fastaData = data;
  }

  handleFastqDataChange(data) {
    this.fastqMetadata = data;
  }

  isMultiExpeditionUpload() {
    return this.expeditionCode === MULTI_EXPEDITION;
  }

  async upload() {
    this.uploading = true;
    this.$scope.$broadcast('show-errors-check-validity');

    if (!this.checkCoordinatesVerified() || this.uploadForm.$invalid) {
      this.uploading = false;
      return;
    }

    const data = this.getUploadData();
    const hasReload =
      !this.validateOnly &&
      (data.reloadWorkbooks || data.dataSourceMetadata.some(d => d.reload));

    const upload = () =>
      this.onUpload({ data })
        .then(success => {
          if (success) {
            this.$onInit();
            this.$scope.$broadcast('show-errors-reset');
          }
        })
        .finally(() => {
          this.uploading = false;
        });

    if (hasReload) {
      const reloadSheets = [];

      if (data.reloadWorkbooks) {
        const worksheets = this.currentProject.config.entities
          .filter(e => e.worksheet)
          .map(e => e.worksheet);
        const workbook = await workbookToJson(data.workbooks[0]);
        Object.keys(workbook)
          .filter(k => worksheets.includes(k))
          .forEach(s => reloadSheets.push(s));
      }

      data.dataSourceMetadata.forEach(
        wd => wd.reload && reloadSheets.push(wd.metadata.sheetName),
      );

      const confirm = this.$mdDialog
        .confirm()
        .title('Confirm Data Replace')
        .htmlContent(
          `<br/><p>All existing ${reloadSheets.join(
            ', ',
          )} data will replaced with the data in this upload.</p><p><strong>This will also delete any child data that references the removed rows.</strong></p><p><strong>Are you sure you want to continue?</strong></p>`,
        )
        .ok('Upload')
        .cancel('Cancel');

      this.$mdDialog
        .show(confirm)
        .then(() => {
          upload();
        })
        .catch(() => {});
    } else {
      upload();
    }
  }

  canReload(worksheet) {
    return (
      !this.validateOnly &&
      (!this.isMultiExpeditionUpload() ||
        this.currentProject.config.entities.some(
          e => e.worksheet === worksheet && e.type === 'Photo',
        ))
    );
  }

  checkCoordinatesVerified() {
    return !this.coordinateWorksheets.some(
      w => !this.verifiedCoordinateWorksheets.includes(w),
    );
  }

  getUploadData() {
    const data = {
      upload: !this.validateOnly,
      reloadWorkbooks: false,
      dataSourceMetadata: [],
      dataSourceFiles: [],
    };

    if (!this.isMultiExpeditionUpload()) {
      data.expeditionCode = this.expeditionCode;
    }

    this.worksheetData.forEach(wd => {
      if (wd.worksheet === 'Workbook') {
        data.workbooks = [wd.file];
        data.reloadWorkbooks = !this.isMultiExpeditionUpload() && wd.reload;
      } else {
        data.dataSourceMetadata.push({
          dataType: 'TABULAR',
          filename: wd.file.name,
          reload: this.canReload(wd.worksheet) && wd.reload,
          metadata: {
            sheetName: wd.worksheet,
          },
        });
        data.dataSourceFiles.push(wd.file);
      }
    });
    if (this.dataTypes.Fasta) {
      this.fastaData.forEach(fd => {
        data.dataSourceMetadata.push({
          dataType: 'FASTA',
          filename: fd.file.name,
          reload: false,
          metadata: {
            conceptAlias: this.currentProject.config.entities.find(
              e => e.type === 'Fasta',
            ).conceptAlias,
            marker: fd.marker,
          },
        });
        data.dataSourceFiles.push(fd.file);
      });
    }
    if (this.dataTypes.Fastq) {
      data.dataSourceMetadata.push({
        dataType: 'FASTQ',
        filename: this.fastqMetadata.file.name,
        reload: false,
        metadata: {
          conceptAlias: this.currentProject.config.entities.find(
            e => e.type === 'Fastq',
          ).conceptAlias,
          libraryLayout: this.fastqMetadata.libraryLayout,
          libraryStrategy: this.fastqMetadata.libraryStrategy,
          librarySource: this.fastqMetadata.librarySource,
          librarySelection: this.fastqMetadata.librarySelection,
          platform: this.fastqMetadata.platform,
          designDescription: this.fastqMetadata.designDescription,
          instrumentModel: this.fastqMetadata.instrumentModel,
        },
      });
      data.dataSourceFiles.push(this.fastqMetadata.file);
    }

    return data;
  }

  async verifyCoordinates(worksheet, workbook) {
    const { config } = this.currentProject;
    const eventEntity = config.entities.find(e => e.conceptAlias === 'Event');
    const { worksheet: eventWorksheet } = eventEntity;

    const latColumn = (
      eventEntity.attributes.find(a => a.uri === LAT_URI) || {}
    ).column;
    const lngColumn = (
      eventEntity.attributes.find(a => a.uri === LNG_URI) || {}
    ).column;

    if (!workbook) {
      const data = this.worksheetData.find(d => d.worksheet === worksheet);
      workbook = await workbookToJson(data.file);
    }

    try {
      const d = workbook.isExcel ? workbook[eventWorksheet] : workbook.default;
      if (!d.some(e => e[latColumn] && e[lngColumn])) {
        angular.toaster.error(
          `We didn't find any coordinates for your ${eventWorksheet} records`,
        );
        this.verifiedCoordinateWorksheets.push(worksheet);
        return;
      }

      const uniqueKey = eventEntity.hashed
        ? config.entities.find(
            e =>
              e.worksheet === eventWorksheet &&
              e.parentEntity === eventEntity.conceptAlias,
          ).uniqueKey
        : eventEntity.uniqueKey;

      const scope = Object.assign(this.$scope.$new(true), {
        d,
        latColumn,
        lngColumn,
        uniqueKey,
      });
      const naanDialog = this.$mdDialog('naanDialog') || Promise.resolve(true);

      naanDialog.then(
        res =>
          res &&
          this.$mdDialog
            .show({
              template:
                '<md-dialog class="upload-map-dialog"><upload-map-dialog layout="column" unique-key="uniqueKey" lat-column="latColumn" lng-column="lngColumn" data="d"></upload-map-dialog></md-dialog>',
              scope,
            })
            .then(() => {
              this.verifiedCoordinateWorksheets.push(worksheet);
            })
            .catch(() => {
              const i = this.verifiedCoordinateWorksheets.findIndex(
                v => v === worksheet,
              );
              if (i > -1) {
                this.verifiedCoordinateWorksheets.splice(i, 1);
              }
            }),
      );
    } catch (e) {
      angular.catcher('Failed to load samples map')(e);
      // need to $scope.$apply here b/c FileReader isn't an angular object
      this.$scope.$apply(() => {
        const i = this.verifiedCoordinateWorksheets.findIndex(
          v => v === worksheet,
        );
        if (i > -1) {
          this.verifiedCoordinateWorksheets.splice(i, 1);
        }
      });
    }
  }

  getAvailableDataTypes() {
    const dataTypes = [
      {
        name: 'Workbook',
        isWorksheet: false,
      },
    ];

    this.currentProject.config.entities.forEach(e => {
      let name = e.worksheet;
      let isWorksheet = true;

      if (!name) {
        switch (e.type) {
          case 'Fastq':
          case 'Fasta':
            name = e.type;
            isWorksheet = false;
            break;
          default:
            return; // skip this b/c there is no worksheet?
        }
      }

      if (dataTypes.find(d => d.name === name)) return;

      dataTypes.push({
        name,
        isWorksheet,
        isRequired: dt =>
          this.newExpedition && !dt.Workbook && name === 'Events',
        help:
          name === 'Events'
            ? 'An Events worksheet is required if you are creating a new expedition.'
            : undefined,
      });
    });

    return dataTypes;
  }

  setCoordinateWorksheet(worksheet) {
    return this.currentProject.config.entities
      .filter(e => e.attributes.some(a => a.uri === LAT_URI))
      .some(e => e.worksheet === worksheet);
  }
}

export default {
  template,
  controller: UploadController,
  bindings: {
    isVisible: '<',
    currentUser: '<',
    currentProject: '<',
    userExpeditions: '<',
    onMetadataChange: '&',
    onUpload: '&',
  },
};
