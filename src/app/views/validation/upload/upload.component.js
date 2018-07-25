import angular from 'angular';
import { getFileExt } from '../../../utils/utils';
import { workbookToJson } from '../../../utils/tabReader';

const template = require('./upload.html');

const defaultFastqMetadata = {
  libraryLayout: null,
  libraryStrategy: null,
  librarySource: null,
  librarySelection: null,
  platform: null,
  designDescription: null,
  instrumentModel: null,
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
    this.verifySampleLocations = false;
    this.sampleLocationsVerified = false;
    this.validateOnly = false;
  }

  $onChanges(changesObj) {
    if ('currentUser' in changesObj) {
      this.validateOnly = !!this.currentUser;
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
        file: w === 'Samples' ? this.fimsMetadata : undefined,
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
    if (worksheet === 'Samples') {
      this.onMetadataChange({
        fimsMetadata: file,
      });
    }
    const data = this.worksheetData.find(d => d.worksheet === worksheet);

    if (data) {
      data.file = file;
      data.reload = reload;
    } else {
      this.worksheetData.push({ worksheet, file, reload });
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
          this.onMetadataChange({ fimsMetadata: undefined });
          this.$onInit();
          this.dataTypes.worksheet = true;
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
          )} data will replaced with the data in this upload.</p><p><strong>Are you sure you want to continue?</strong></p>`,
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
    if (
      this.worksheetData.find(d => d.worksheet === 'Samples' && d.file) &&
      this.verifySampleLocations &&
      !this.sampleLocationsVerified
    ) {
      return false;
    }
    return true;
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

  verifyCoordinates() {
    const LAT_COL_DEF = 'http://rs.tdwg.org/dwc/terms/decimalLatitude';
    const LON_COL_DEF = 'http://rs.tdwg.org/dwc/terms/decimalLongitude';

    const { config } = this.currentProject;
    const eventEntity = config.entities.find(e => e.conceptAlias === 'Event');
    const { worksheet } = eventEntity;
    const latColumn = config.findAttributesByDefinition(
      worksheet,
      LAT_COL_DEF,
    )[0].column;
    const lngColumn = config.findAttributesByDefinition(
      worksheet,
      LON_COL_DEF,
    )[0].column;

    workbookToJson(this.fimsMetadata)
      .then(
        workbook => (workbook.isExcel ? workbook[worksheet] : workbook.default),
      )
      .then(data => {
        if (data.length === 0) {
          angular.toaster.error(
            'Failed to find lat/long coordinates for your samples',
          );
          return undefined;
        }

        const scope = Object.assign(this.$scope.$new(true), {
          data,
          latColumn,
          lngColumn,
          uniqueKey: eventEntity.uniqueKey,
        });

        const naanDialog =
          this.$mdDialog('naanDialog') || Promise.resolve(true);

        naanDialog.then(
          res =>
            res &&
            this.$mdDialog
              .show({
                template:
                  '<upload-map-dialog layout="column" unique-key="uniqueKey" lat-column="latColumn" lng-column="lngColumn" data="data"></upload-map-dialog>',
                scope,
              })
              .then(() => {
                this.sampleLocationsVerified = true;
              })
              .catch(() => {
                this.sampleLocationsVerified = false;
              }),
        );
      })
      .catch(e => {
        angular.catcher('Failed to load samples map')(e);
        // need to apply here b/c FileReader isn't an angular object
        this.$scope.$apply(() => {
          this.verifySampleLocations = false;
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
}

export default {
  template,
  controller: UploadController,
  bindings: {
    isVisible: '<',
    currentUser: '<',
    currentProject: '<',
    fimsMetadata: '<',
    userExpeditions: '<',
    onMetadataChange: '&',
    onUpload: '&',
  },
};
