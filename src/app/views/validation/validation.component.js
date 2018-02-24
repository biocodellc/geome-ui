import angular from 'angular';
import XLSXReader from '../../utils/XLSXReader';

import StatusPolling from './StatusPolling';
import detectBrowser from '../../utils/detectBrowser';
import { getFileExt } from '../../utils/utils';

import config from '../../utils/config';
const { naan, restRoot, mapboxToken } = config;

const template = require('./validation.html');

const defaultResults = {
  validation: {},
  error: '',
  status: '',
  uploadMessage: '',
  successMessage: '',
  showCancelButton: false,
  showOkButton: false,
  showContinueButton: false,
  showStatus: false,
  showValidationMessages: false,
  showUploadMessages: false,
  showSuccessMessages: false,
};

const checkBrowser = () => {
  const { browser, version } = detectBrowser();

  if (browser === 'Explorer' && version <= 9) {
    angular.alerts.warn(
      `NOTE: Your browser only supports the Template Generator and not the Validation Component.
         Use IE 11, or a recent version of Chrome, Firefox, or Safari to run data validation.`,
    );
  }
};

class ValidationController {
  constructor($scope, $http, $uibModal, DataService) {
    'ngInject';

    this.$scope = $scope;
    this.$uibModal = $uibModal;
    this.DataService = DataService;
    const latestExpeditionCode = null;

    // TODO this should go in the DataService class
    this.polling = new StatusPolling($http, restRoot);
    // TODO find a better place for this
    this.polling.on('error', err => {
      this.results.error = err;
      this.results.showOkButton = true;
    });
    this.polling.on('status', status => {
      this.results.status = status;
      this.results.error = null;
    });

    this.fimsMetadata = null;
    this.verifyDataPoints = false;
    this.coordinatesVerified = false;
    this.displayResults = false;
    this.coordinatesErrorClass = null;
    this.showGenbankDownload = false;
    this.activeTab = 0;
  }

  $onInit() {
    this.results = Object.assign({}, defaultResults);

    checkBrowser();
  }

  handleUpload(uploadData) {
    const { projectId } = this.currentProject;

    return this.validateSubmit(
      Object.assign({}, uploadData, { projectId }),
    ).then(({ data }) => {
      if (data.isValid) {
        this.continueUpload(data.id);
      } else if (data.hasError) {
        this.results.validation = data;
        this.results.showOkButton = true;
        this.results.showValidationMessages = true;
      } else {
        this.results.validation = data;
        this.results.showValidationMessages = true;
        this.results.showStatus = false;
        this.results.showContinueButton = true;
        this.results.uploadId = data.id;
        this.results.showCancelButton = true;
        // if (!angular.equals(this.fastqMetadata, defaultFastqMetadata)) {
        //   this.showGenbankDownload = true;
        // }
      }
    });
  }

  continueUpload(uploadId) {
    // this.polling.startPolling();
    this.results.showStatus = true;
    return this.DataService.upload(uploadId)
      .then(({ data }) => {
        this.results.successMessage = data.message;
        this.modalInstance.close();
        console.log(this.expeditionCode);
        this.latestExpeditionCode = this.expeditionCode;
        // if (!angular.equals(this.fastqMetadata, defaultFastqMetadata)) {
        //   this.showGenbankDownload = true;
        // }
        // this.resetForm();
        // }
      })
      .catch(response => {
        console.log('failed ->', response);
        this.modalInstance.close();
        // this.results = Object.assign({}, defaultResults);
        this.results.error =
          response.data.message ||
          response.data.error ||
          response.data.usrMessage ||
          'Server Error!';
        // this.results.showOkButton = true;
      });
    // .finally(this.polling.stopPolling);
  }

  validateSubmit(data) {
    this.results = Object.assign({}, defaultResults);
    this.showGenbankDownload = false;
    // start polling here, since firefox support for progress events doesn't seem to be very good
    // this.polling.startPolling();
    this.results.showStatus = true;
    this.openResultsModal();
    return this.DataService.validate(data).catch(response => {
      this.results.error = response.data.usrMessage || 'Server Error!';
      this.results.showOkButton = true;
      return response;
    });
    // .finally(this.polling.stopPolling);
  }

  // TODO should this be moved to the validate component?
  validate() {
    const data = {
      projectId: this.currentProject.projectId,
      expeditionCode: this.expeditionCode,
      upload: false,
    };

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

    this.validateSubmit(data).then(response => {
      this.results.validation = response.data;
      this.modalInstance.close();
    });
  }

  openResultsModal() {
    this.modalInstance = this.$uibModal.open({
      component: 'fimsResultsModal',
      size: 'md',
      windowClass: 'app-modal-window',
      backdrop: 'static',
      resolve: {
        onContinue: () => () => {
          this.continueUpload(this.results.uploadId);
          this.results.showContinueButton = false;
          this.results.showCancelButton = false;
          this.results.showValidationMessages = false;
        },
        results: () => this.results,
      },
    });

    this.modalInstance.result.finally(() => {
      if (!this.results.error) {
        this.activeTab = 2; // index 2 is the results tab
      }
      this.displayResults = true;
      this.results.showStatus = false;
      this.results.showValidationMessages = true;
      this.results.showSuccessMessages = true;
      this.results.showUploadMessages = false;
    });
  }

  // TODO move this to uploads?
  resetForm() {
    this.fimsMetadata = null;
    this.fastaFiles = [];
    this.fastaData = [];
    this.fastaCnt = [0];
    this.fastqFilenames = null;
    // angular.copy(defaultFastqMetadata, this.fastqMetadata);
    this.expeditionCode = null;
    this.verifyDataPoints = false;
    this.coordinatesVerified = false;
    this.$scope.$broadcast('show-errors-reset');
  }

  fimsMetadataChange(fimsMetadata) {
    this.fimsMetadata = fimsMetadata;
    // Clear the results
    this.results = Object.assign({}, defaultResults);

    if (this.fimsMetadata) {
      // Check NAAN
      this.parseSpreadsheet('~naan=[0-9]+~', 'Instructions').then(n => {
        if (naan && n && n > 0) {
          if (n !== naan) {
            const message = `Spreadsheet appears to have been created using a different FIMS/BCID system.
                 Spreadsheet says NAAN = ${n}
                 System says NAAN = ${naan}
                 Proceed only if you are SURE that this spreadsheet is being called.
                 Otherwise, re-load the proper FIMS system or re-generate your spreadsheet template.`;
            angular.alerts.error(message);
          }
        }
      });

      // generateMap('map', this.currentProject.projectId, this.fimsMetadata, mapboxToken).then(
      //   function () {
      //     this.verifyDataPoints = true;
      //   }, function () {
      //     this.verifyDataPoints = false;
      //   }).always(function () {
      //   // this is a hack since we are using jQuery for generateMap
      //   this.$scope.$apply();
      // });
    } else {
      this.verifyDataPoints = false;
      this.coordinatesVerified = false;
    }
  }

  parseSpreadsheet(regExpression, sheetName) {
    const splitFileName = this.fimsMetadata.name.split('.');

    if (XLSXReader.exts.includes(splitFileName[splitFileName.length - 1])) {
      return new XLSXReader()
        .findCell(this.fimsMetadata, regExpression, sheetName)
        .then(
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
  }
}

export default {
  template,
  controller: ValidationController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
    userExpeditions: '<',
  },
};
