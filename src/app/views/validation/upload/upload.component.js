import angular from "angular";

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
  constructor(ExpeditionService) {
    'ngInject';
    this.ExpeditionService = ExpeditionService;
  }

  $onInit() {
    this.newExpedition = (this.userExpeditions.length === 0);
    this.fastaData = [];
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

  handleFastaDataChange(data) {
    this.fastaData = data;
  }

  upload() {
    this.$scope.$broadcast('show-errors-check-validity');

    const submitIfValid = () => {
      if (!this.checkCoordinatesVerified() || this.uploadForm.$invalid) {
        return;
      }

      this.onUpload({ data: this.getUploadData() })
    };

    if (this.newExpedition) {
      this.checkExpeditionExists({ expeditionCode: this.expeditionCode })
        .then((exists) => {
          (exists) ?
            this.uploadForm.newExpeditionCode.$setValidity("exists", false) :
            this.uploadForm.newExpeditionCode.$setValidity("exists", true);
        })
        .finally(() => submitIfValid());
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
      public: true, //TODO allow a toggle? Actually we should remove this and require visiblity to be set via expedition page

    };

    if (this.dataTypes.fims) {
      data.fimsMetadata = this.fimsMetadata;
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

  checkExpeditionExists(expeditionCode) {
    return this.ExpeditionService.getExpedition(this.currentProject.projectId, expeditionCode)
      // if we get an expedition, then it already exists
      .then(({ data }) => !!(data));
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