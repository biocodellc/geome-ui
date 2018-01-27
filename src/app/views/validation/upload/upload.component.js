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
      expeditionId: 0,
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

  // handleNewExpeditionChange(newExpedition) {
  // this.newExpedition = newExpedition;
  // }

  handleExpeditionChange(expeditionCode) {
    if (expeditionCode === 'CREATE') {
      const modalInstance = this.$uibModal.open({
        component: 'fimsCreateExpeditionModal',
        size: 'md',
        windowClass: 'app-modal-window',
        backdrop: 'static',
        resolve: {
          metadataProperties: () =>
            this.currentProject.config.expeditionMetadataProperties,
          projectId: () => this.currentProject.projectId,
        },
      });
      modalInstance.close(expedition => {
        this.userExpeditions.push(expedition);
        this.expeditionCode = expedition.expeditionCode;
      });
      modalInstance.dismiss(() => {
        this.expeditionCode = '';
      });
    } else {
      this.expeditionCode = expeditionCode;
    }
  }

  handleFastaDataChange(data) {
    this.fastaData = data;
  }

  upload() {
    this.$scope.$broadcast('show-errors-check-validity');

    // const submitIfValid = () => {
    // if (!this.checkCoordinatesVerified() || this.uploadForm.$invalid) {
    //   return;
    // }

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
      reload: false,
    };

    if (this.dataTypes.fims) {
      if (['xlsx', 'xls'].includes(getFileExt(this.fimsMetadata.name))) {
        data.workbooks = [this.fimsMetadata];
      } else {
        data.dataSourceMetadata = [
          {
            dataType: 'TABULAR',
            filename: this.fimsMetadata.name,
            metadata: {
              sheetName: 'Samples', // TODO this needs to be dynamic, depending on the entity being validated
            },
          },
        ];
        data.dataSourceFiles = [this.fimsMetadata];
      }
    }
    if (this.dataTypes.fasta) {
      // TODO fix this
      // data.fastaFiles = this.fastaData.files;
      // this.fastaData.forEach((data, index) => {
      //   data.filename = this.fastaFiles[ index ].name;
      // });
      // data.fastaData = Upload.jsonBlob(this.fastaData);
    }
    if (this.dataTypes.fastq) {
      // data.fastqMetadata = Upload.jsonBlob(this.fastqMetadata);
      // data.fastqFilenames = this.fastqFilenames;
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
