import detectBrowser from '../../utils/detectBrowser';

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

const checkBrowser = $mdDialog => {
  const { browser, version } = detectBrowser();

  if (browser === 'Explorer' && version <= 9) {
    $mdDialog.show(
      $mdDialog
        .alert()
        .clickOutsideToClose(true)
        .title('Unsupported Browser')
        .textContent(
          `Your browser only supports the Template Generator and not the Validation Component.
         Use IE 11, or a recent version of Chrome, Firefox, or Safari to run data validation.`,
        )
        .ok('Got it!'),
    );
  }
};

class ValidationController {
  constructor($scope, $interval, $uibModal, $mdDialog, DataService) {
    'ngInject';

    this.$scope = $scope;
    this.$uibModal = $uibModal;
    this.$mdDialog = $mdDialog;
    this.DataService = DataService;
    this.$interval = $interval;

    this.latestExpeditionCode = undefined;
    this.displayResults = false;
    this.showGenbankDownload = false;
    this.activeTab = 0;
  }

  $onInit() {
    this.results = Object.assign({}, defaultResults);

    checkBrowser(this.$mdDialog);
  }

  handleUpload(uploadData) {
    const { projectId } = this.currentProject;

    return this.validateSubmit(
      Object.assign({}, uploadData, { projectId }),
    ).then(data => {
      if (!data) return false;

      if (data.hasError || !data.exception) {
        this.results.showValidationMessages = true;
      }

      if (!uploadData.upload) {
        if (data.isValid) {
          this.results.showSuccessMessages = true;
          this.results.successMessage = 'Successfully Validated!';
        }
        this.results.validation = data;
        this.modalInstance.close();
        this.activeTab = 1;
        return false;
      }

      if (data.isValid) {
        this.continueUpload(data.id);
      } else if (data.hasError) {
        this.results.validation = data;
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
          this.showGenbankDownload = !!uploadData.dataSourceMetadata.find(
            m => m.dataType === 'FASTQ',
          );
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
        this.results.validation.isValid = false;
        this.results.validation.exception =
          response.data.message ||
          response.data.error ||
          response.data.usrMessage ||
          'Server Error!';
      });
  }

  validateSubmit(data) {
    // Clear the results
    this.results = Object.assign({}, defaultResults, {
      showStatus: true,
      status: 'Uploading...',
    });
    this.openResultsModal();
    return this.DataService.validate(data)
      .then(
        response =>
          new Promise(resolve => {
            const listener = this.DataService.validationStatus(
              response.data.id,
            );

            listener.on('status', status => {
              this.results.status = `Uploading...<br/>${status}`;
              this.results.validation.exception = null;
            });
            listener.on('result', resolve);
          }),
      )
      .catch(response => {
        this.results.validation.isValid = false;
        this.results.validation.exception =
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
