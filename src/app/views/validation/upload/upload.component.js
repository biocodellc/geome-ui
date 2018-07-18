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
  }

  $onChanges(changesObj) {
    if ('fimsMetadata' in changesObj) {
      if (this.worksheetData) {
        const samplesData = this.worksheetData.find(
          d => d.worksheet === 'Samples',
        );

        this.dataTypes.Samples = true;

        if (samplesData) {
          samplesData.file = this.fimsMetadata;
        } else {
          this.worksheetData.push({
            file: this.fimsMetadata,
            worksheet: 'Samples',
          });
        }
      }

      if (this.fimsMetadata && this.isVisible) this.verifyCoordinates();
      this.verifySampleLocations = !!this.fimsMetadata;
      this.sampleLocationsVerified = false;
    } else if ('isVisible' in changesObj) {
      if (this.fimsMetadata && this.isVisible && !this.sampleLocationsVerified)
        this.verifyCoordinates();
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

  handleWorksheetDataChange(worksheet, file) {
    if (worksheet === 'Samples') {
      this.onMetadataChange({
        fimsMetadata: file,
      });
    }
    const data = this.worksheetData.find(d => d.worksheet === worksheet);

    if (data) {
      data.file = file;
    } else {
      this.worksheetData.push({ worksheet, file });
    }
  }

  handleFastaDataChange(data) {
    this.fastaData = data;
  }

  handleFastqDataChange(data) {
    this.fastqMetadata = data;
  }

  upload() {
    this.$scope.$broadcast('show-errors-check-validity');

    if (!this.checkCoordinatesVerified() || this.uploadForm.$invalid) {
      return;
    }

    this.onUpload({ data: this.getUploadData() }).then(success => {
      if (success) {
        this.onMetadataChange({ fimsMetadata: undefined });
        this.$onInit();
        this.dataTypes.worksheet = true;
        this.$scope.$broadcast('show-errors-reset');
      }
    });
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
      upload: true,
      reloadWorkbooks: true,
      dataSourceMetadata: [],
      dataSourceFiles: [],
    };

    this.worksheetData.forEach(wd => {
      if (['xlsx', 'xls'].includes(getFileExt(wd.file.name))) {
        data.workbooks = [wd.file];
      } else {
        data.dataSourceMetadata.push({
          dataType: 'TABULAR',
          filename: wd.file.name,
          reload: true,
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
    const sampleEntity = config.entities.find(e => e.conceptAlias === 'Sample');
    const { worksheet } = sampleEntity;
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
          uniqueKey: sampleEntity.uniqueKey,
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
    const dataTypes = [];

    this.currentProject.config.entities.forEach(e => {
      let name = e.worksheet;

      if (!name) {
        switch (e.type) {
          case 'Fastq':
          case 'Fasta':
            name = e.type;
            break;
          default:
            return; // skip this b/c there is no worksheet?
        }
      }

      if (dataTypes.find(d => d.name === name)) return;

      dataTypes.push({
        name,
        isRequired: this.newExpedition && name === 'Samples',
        help:
          name === 'Samples'
            ? 'A Samples worksheet is required if you are creating a new expedition.'
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
    currentProject: '<',
    fimsMetadata: '<',
    userExpeditions: '<',
    onMetadataChange: '&',
    onUpload: '&',
  },
};
