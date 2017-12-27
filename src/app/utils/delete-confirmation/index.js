import angular from 'angular';


class DeleteConfirmationController {
  constructor($uibModalInstance, text) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.text = text;
  }

  delete() {
    this.$uibModalInstance.close();
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
}

class ConfirmationService {
  constructor($uibModal) {
    'ngInject';
    this.$uibModal = $uibModal;
  }

  confirm(text, cb) {
    const modal = this.$uibModal.open({
      template: require('./delete-confirmation.html'),
      resolve: {
        text: () => text,
      },
      size: 'md',
      controller: DeleteConfirmationController,
      controllerAs: '$ctrl',
      windowClass: 'app-modal-window',
      backdrop: 'static',
    });

    modal.result.then(cb);
  }
}

export default angular.module('fimsDeleteConfirmation', [])
  .service('ConfirmationService', ConfirmationService)
  .name;
