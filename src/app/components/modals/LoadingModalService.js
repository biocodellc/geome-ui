import angular from 'angular';

class LoadingModalService {
  constructor($uibModal) {
    this._modalInstance = undefined;
    this._uibModal = $uibModal;
  }

  close() {
    if (this._modalInstance) {
      this._modalInstance.opened.finally(() => {
        this._modalInstance.close();
        this._modalInstance = undefined;
      });
    }
  }

  open() {
    if (!this._modalInstance) {
      this._modalInstance = this._uibModal.open({
        template: '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
        windowTemplate: '<div uib-modal-transclude></div>',
        appendTo: angular.element(document.querySelector('app')),
        size: 'sm',
        backdrop: true,
      });
    }
  }
}

LoadingModalService.$inject = ['$uibModal'];

export default LoadingModalService;
