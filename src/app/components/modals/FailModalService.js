import FailModalController from './FailModalController';

class FailModalService {
  constructor($uibModal) {
    this.modalInstance = undefined;
    this.$uibModal = $uibModal;
  }

  open(title, message) {
    this.modalInstance = this.$uibModal.open({
      template: require('./templates/failModal.html'),
      size: 'md',
      controller: FailModalController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: true,
      resolve: {
        message() {
          return message;
        },
        title() {
          if (!title) title = 'Error';
          return title;
        },
      },
    });
  }
}

FailModalService.$inject = ['$uibModal'];

export default FailModalService;
