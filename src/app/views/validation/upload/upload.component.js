import angular from 'angular';
import {
  findExcelCell,
  isExcelFile,
  parseWorkbookSheetNames,
  workbookToJson,
} from '../../../utils/tabReader';
import appConfig from '../../../utils/config';

const { naan } = appConfig;
const template = require('./upload.html');

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
    return findExcelCell(file, regExpression, sheetName).then(
      match =>
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
  }

  $onChanges(changesObj) {
    if ('currentUser' in changesObj) {
      this.validateOnly = !this.currentUser;
    }

    if (this.currentProject && 'currentProject' in changesObj) {
      this.availableDataTypes = this.getAvailableDataTypes();
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

    this.dataTypes = dataTypes;
  }

  handleExpeditionChange(expeditionCode) {
    if (expeditionCode === 'CREATE') {
      this.$uibModal
        .open({
          component: 'fimsCreateExpeditionModal',
          size: 'md',
          windowClass: 'app-modal-window',
          backdrop: 'static',
          resolve: {
            metadataProperties: () =>
              this.currentProject.config.expeditionMetadataProperties,
            projectId: () => this.currentProject.projectId,
          },
        })
        .result.then(expedition => {
          this.userExpeditions = this.userExpeditions.concat([expedition]);
          this.expeditionCode = expedition.expeditionCode;
        })
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

    if (fileChanged) {
      if (worksheet === 'Workbook') {
        // Check NAAN
        parseSpreadsheet('~naan=[0-9]+~', 'Instructions', file).then(n => {
          if (naan && n && n > 0 && Number(n) !== Number(naan)) {
            this.$mdDialog
              .show(
                this.$mdDialog
                  .alert('naanDialog')
                  .clickOutsideToClose(true)
                  .title('Incorrect NAAN')
                  .css('naan-dialog')
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
              .then(() => {
                parseWorkbookSheetNames(file).then(sheets => {
                  sheets.some(s => {
                    if (this.setCoordinateWorksheet(s)) {
                      this.verifyCoordinates(worksheet);
                      this.coordinateWorksheets.push('Workbook');
                      return true;
                    }
                    return false;
                  });
                });
              });
          } else {
            parseWorkbookSheetNames(file).then(sheets => {
              sheets.some(s => {
                if (this.setCoordinateWorksheet(s)) {
                  this.verifyCoordinates(worksheet);
                  this.coordinateWorksheets.push('Workbook');
                  return true;
                }
                return false;
              });
            });
          }
        });
      } else if (this.setCoordinateWorksheet(worksheet)) {
        this.verifyCoordinates(worksheet);
        this.coordinateWorksheets.push(worksheet);
      }
    } else if (!file) {
      const i = this.coordinateWorksheets.findIndex(v => v === worksheet);
      if (i > -1) {
        this.coordinateWorksheets.splice(i, 1);
      }
    }
  }

  handleFastaDataChange(data) {
    this.fastaData = data;
  }

  handleFastqDataChange(data) {
    this.fastqMetadata = data;
  }

  async upload() {
    this.$scope.$broadcast('show-errors-check-validity');

    if (!this.checkCoordinatesVerified() || this.uploadForm.$invalid) {
      return;
    }

    const data = this.getUploadData();
    const hasReload =
      !this.validateOnly &&
      (data.reloadWorkbooks || data.dataSourceMetadata.some(d => d.reload));

    const upload = () =>
      this.onUpload({ data }).then(success => {
        if (success) {
          this.$onInit();
          this.$scope.$broadcast('show-errors-reset');
        }
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
        .title('Confirm Data Reload')
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

  checkCoordinatesVerified() {
    return !this.coordinateWorksheets.some(
      w => !this.verifiedCoordinateWorksheets.includes(w),
    );
  }

  getUploadData() {
    const data = {
      expeditionCode: this.expeditionCode,
      upload: !this.validateOnly,
      reloadWorkbooks: false,
      dataSourceMetadata: [],
      dataSourceFiles: [],
    };

    this.worksheetData.forEach(wd => {
      if (wd.worksheet === 'Workbook') {
        data.workbooks = [wd.file];
        data.reloadWorkbooks = wd.reload;
      } else {
        data.dataSourceMetadata.push({
          dataType: 'TABULAR',
          filename: wd.file.name,
          reload: wd.reload,
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

  verifyCoordinates(worksheet) {
    const { config } = this.currentProject;
    const eventEntity = config.entities.find(e => e.conceptAlias === 'Event');
    const { worksheet: eventWorksheet } = eventEntity;

    const latColumn = (
      eventEntity.attributes.find(a => a.uri === LAT_URI) || {}
    ).column;
    const lngColumn = (
      eventEntity.attributes.find(a => a.uri === LNG_URI) || {}
    ).column;

    const data = this.worksheetData.find(d => d.worksheet === worksheet);
    workbookToJson(data.file)
      .then(
        workbook =>
          workbook.isExcel ? workbook[eventWorksheet] : workbook.default,
      )
      .then(d => {
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

        const naanDialog =
          this.$mdDialog('naanDialog') || Promise.resolve(true);

        naanDialog.then(
          res =>
            res &&
            this.$mdDialog
              .show({
                template:
                  '<upload-map-dialog layout="column" unique-key="uniqueKey" lat-column="latColumn" lng-column="lngColumn" data="d"></upload-map-dialog>',
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
      })
      .catch(e => {
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
      });
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
