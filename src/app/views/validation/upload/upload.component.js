import { getFileExt } from "../../../utils/utils";

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
  constructor($scope, ExpeditionService) {
    'ngInject';
    this.$scope = $scope;
    this.ExpeditionService = ExpeditionService;
  }

  $onInit() {
    this.newExpedition = (this.userExpeditions.length === 0);
    this.fastaData = [];
    this.dataTypes = {};
  }

  handleDatatypes(dataTypes) {
    if (!dataTypes.fastq) {
      this.fastqMetadata = Object.assign({}, defaultFastqMetadata);
    }

    this.dataTypes = dataTypes;
  }

  handleNewExpeditionChange(newExpedition) {
    this.newExpedition = newExpedition;
  }

  handleExpeditionChange(expeditionCode) {
    this.expeditionCode = expeditionCode;
  }

  handleFastaDataChange(data) {
    this.fastaData = data;
  }

  upload() {
    this.$scope.$broadcast('show-errors-check-validity');

    const submitIfValid = () => {
      // if (!this.checkCoordinatesVerified() || this.uploadForm.$invalid) {
      //   return;
      // }

      this.onUpload({ data: this.getUploadData() })
    };

    if (this.newExpedition) {
      this.ExpeditionService.create(
        this.currentProject.projectId,
        {
          expeditionCode: this.expeditionCode,
          expeditionTitle: `${this.expeditionCode} Dataset`,
          visibility: 'anyone',
          isPublic: true,
        })
        .then(({ data }) => this.userExpeditions.push(data))
        .then(submitIfValid)
        .catch(response => {
          // this.uploadForm.newExpeditionCode.$setValidity("exists", true)
          console.error(response);
        })
    } else {
      submitIfValid();
    }
  }

  checkCoordinatesVerified() {
    if (this.verifyDataPoints && !this.coordinatesVerified) {
      this.coordinatesErrorClass = "has-error";
      return false;
    } else {
      this.coordinatesErrorClass = null;
      return true;
    }
  }

  getUploadData() {
    const data = {
      expeditionCode: this.expeditionCode,
      upload: true,
      reload: false,
    };

    if (this.dataTypes.fims) {
      if ([ 'xlsx', 'xls' ].includes(getFileExt(this.fimsMetadata.name))) {
        data.workbooks = [ this.fimsMetadata ];
      } else {
        data.dataSourceMetadata = [ {
          dataType: 'TABULAR',
          filename: this.fimsMetadata.name,
          metadata: {
            sheetName: 'Samples' //TODO this needs to be dynamic, depending on the entity being validated
          },
        } ];
        data.dataSourceFiles = [ this.fimsMetadata ];
      }
    }
    if (this.dataTypes.fasta) {
      //TODO fix this
      // data.fastaFiles = this.fastaData.files;
      // this.fastaData.forEach((data, index) => {
      //   data.filename = this.fastaFiles[ index ].name;
      // });
      // data.fastaData = Upload.jsonBlob(this.fastaData);
    }
    if (this.dataTypes.fastq) {
      data.fastqMetadata = Upload.jsonBlob(this.fastqMetadata);
      data.fastqFilenames = this.fastqFilenames;
    }

    return data;
  }
}

export default {
  template: require('./upload.html'),
  controller: UploadController,
  bindings: {
    currentProject: "<",
    fimsMetadata: '<',
    userExpeditions: '<',
    onMetadataChange: '&',
    onUpload: '&',
  },
};