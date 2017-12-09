import angular from 'angular';

class LoadingModalService {

  constructor($uibModal) {
    this._modalInstance = undefined;
    this._uibModal = $uibModal;
  }

  close() {
    if (this._modalInstance) {
      this._modalInstance.opened. finally(function() {
        this._modalInstance.close();
        this._modalInstance = undefined;
      });
    }
  }

  open() {
    if (!this._modalInstance) {
      this._modalInstance = this._uibModal.open({
        templateUrl: require('./templates/loadingModal.html'),
        windowTemplateUrl: require('./templates/loadingModalWindow.html'),
        appendTo: angular.element(document.querySelector("#content")),
        size: 'sm',
        backdrop: true
      });
    }
  }

}

LoadingModalService.$inject = ['$uibModal'];

export default LoadingModalService;
