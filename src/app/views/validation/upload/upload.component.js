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
    this.dataTypes = {};
  }

  $onChanges(changesObj) {
    if ('fimsMetadata' in changesObj) {
      if (this.fimsMetadata && this.isVisible) this.verifyCoordinates();
      this.verifySampleLocations = !!this.fimsMetadata;
      this.sampleLocationsVerified = false;
    } else if ('isVisible' in changesObj) {
      if (this.fimsMetadata && this.isVisible && !this.sampleLocationsVerified)
        this.verifyCoordinates();
    }
  }

  handleDatatypes(dataTypes) {
    if (!dataTypes.fastq) {
      this.fastqMetadata = Object.assign({}, defaultFastqMetadata);
    }

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

    this.onUpload({ data: this.getUploadData() });
  }

  checkCoordinatesVerified() {
    if (
      this.fimsMetadata &&
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

    if (this.dataTypes.fims) {
      if (['xlsx', 'xls'].includes(getFileExt(this.fimsMetadata.name))) {
        data.workbooks = [this.fimsMetadata];
      } else {
        data.dataSourceMetadata.push({
          dataType: 'TABULAR',
          filename: this.fimsMetadata.name,
          reload: true,
          metadata: {
            sheetName: 'Samples', // TODO this needs to be dynamic, depending on the entity being validated
          },
        });
        data.dataSourceFiles.push(this.fimsMetadata);
      }
    }
    if (this.dataTypes.fasta) {
      this.fastaData.forEach(fd => {
        data.dataSourceMetadata.push({
          dataType: 'FASTA',
          filename: fd.file.name,
          reload: false,
          metadata: {
            conceptAlias: this.currentProject.config.entities.find(
              e => e.type === 'Fasta',
            ).conceptAlias, // TODO this needs to be dynamically choosen by the user
            marker: fd.marker,
          },
        });
        data.dataSourceFiles.push(fd.file);
      });
    }
    if (this.dataTypes.fastq) {
      data.dataSourceMetadata.push({
        dataType: 'FASTQ',
        filename: this.fastqMetadata.file.name,
        reload: false,
        metadata: {
          conceptAlias: this.currentProject.config.entities.find(
            e => e.type === 'Fastq',
          ).conceptAlias, // TODO this needs to be dynamically choosen by the user
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
    const sampleEntity = config.entities.find(
      e => e.conceptAlias === 'Resource',
    );
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
          angular.alerts.warn(
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

        return this.$mdDialog
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
          });
      })
      .catch(e => {
        angular.catcher('Failed to load samples map')(e);
        // need to apply here b/c FileReader isn't an angular object
        this.$scope.$apply(() => {
          this.verifySampleLocations = false;
        });
      });
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
