import { getFileExt } from '../../../utils/utils';

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
  constructor($scope, $uibModal) {
    'ngInject';

    this.$scope = $scope;
    this.$uibModal = $uibModal;
  }

  $onInit() {
    this.fastaData = [];
    this.dataTypes = {};
    this.userExpeditions.splice(0, 0, {
      expeditionCode: 'CREATE',
      expeditionTitle: '-- Create an Expedition --',
    });
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

    // if (!this.checkCoordinatesVerified() || this.uploadForm.$invalid) {
    if (this.uploadForm.$invalid) {
      return;
    }

    this.onUpload({ data: this.getUploadData() });
  }

  checkCoordinatesVerified() {
    if (this.verifyDataPoints && !this.coordinatesVerified) {
      this.coordinatesErrorClass = 'has-error';
      return false;
    }
    this.coordinatesErrorClass = null;
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
}

export default {
  template,
  controller: UploadController,
  bindings: {
    currentProject: '<',
    fimsMetadata: '<',
    userExpeditions: '<',
    onMetadataChange: '&',
    onUpload: '&',
  },
};
