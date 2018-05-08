import angular from 'angular';
import { findExcelCell, isExcelFile } from '../../utils/tabReader';

import detectBrowser from '../../utils/detectBrowser';

import config from '../../utils/config';

const { naan } = config;

const template = require('./validation.html');

const defaultResults = {
  validation: {},
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
  constructor($scope, $interval, $uibModal, DataService) {
    'ngInject';

    this.$scope = $scope;
    this.$uibModal = $uibModal;
    this.DataService = DataService;
    this.$interval = $interval;

    this.fimsMetadata = undefined;
    this.latestExpeditionCode = undefined;
    this.displayResults = false;
    this.showGenbankDownload = false;
    this.activeTab = 0;
  }

  $onInit() {
    this.results = Object.assign({}, defaultResults);

    checkBrowser();
  }

  validate(data) {
    this.validateSubmit(
      Object.assign({}, data, {
        projectId: this.currentProject.projectId,
        expeditionCode: this.expeditionCode,
        upload: false,
      }),
    ).then(resp => {
      this.results.validation = resp;
      this.modalInstance.close();
    });
  }

  handleUpload(uploadData) {
    const { projectId } = this.currentProject;

    return this.validateSubmit(
      Object.assign({}, uploadData, { projectId }),
    ).then(data => {
      if (!data) return false;

      if (data.isValid) {
        this.continueUpload(data.id);
      } else if (data.hasError) {
        this.results.validation = data;
        if (!data.exception) this.results.showValidationMessages = true;
        this.results.showOkButton = true;
        return false;
      }

      Object.assign(this.results, {
        validation: data,
        showValidationMessages: true,
        showStatus: false,
        showContinueButton: true,
        uploadId: data.id,
        showCancelButton: true,
      });

      return this.modalInstance.result.then(success => {
        if (success) {
          this.latestExpeditionCode = uploadData.expeditionCode;
          if (uploadData.dataSourceMetadata.find(m => m.dataType === 'FASTQ')) {
            this.showGenbankDownload = true;
          }
        }
        return success;
      });
    });
  }

  continueUpload(uploadId) {
    this.results.showStatus = true;
    return this.DataService.upload(uploadId)
      .then(({ data }) => {
        this.results.successMessage = data.message;
        this.modalInstance.close(true);
      })
      .catch(response => {
        console.log('failed ->', response);
        this.modalInstance.close(false);
        this.results.validation.error =
          response.data.message ||
          response.data.error ||
          response.data.usrMessage ||
          'Server Error!';
      });
  }

  validateSubmit(data) {
    // Clear the results
    this.results = Object.assign({}, defaultResults, { showStatus: true });
    this.openResultsModal();
    return this.DataService.validate(data)
      .then(
        response =>
          new Promise(resolve => {
            const listener = this.DataService.validationStatus(
              response.data.id,
            );

            listener.on('status', status => {
              this.results.status = status;
              this.results.validation.error = null;
            });
            listener.on('result', resolve);
          }),
      )
      .catch(response => {
        this.results.validation.error =
          response.data.usrMessage || 'Server Error!';
        this.results.showOkButton = true;
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
          this.continuePromise = this.continueUpload(this.results.uploadId);
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

  fimsMetadataChange(fimsMetadata) {
    this.fimsMetadata = fimsMetadata;

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
    }
  }

  parseSpreadsheet(regExpression, sheetName) {
    if (isExcelFile(this.fimsMetadata)) {
      return findExcelCell(this.fimsMetadata, regExpression, sheetName).then(
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
