class FailModalService {
  constructor($uibModal) {
    this.modalInstance = undefined;
    this.$uibModal = $uibModal;
  }

  open(title, message) {
    this.modalInstance = this.$uibModal.open({
      templateUrl: require('./templates/failModal.html'),
      size: 'md',
      controller: 'FailModalCtrl',
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: true,
      resolve: {
        message: function() {
          return message;
        },
        title: function() {
          if (!title)
            title = "Error";
          return title;
        }
      }

    });
  }
}

FailModalService.$inject = ['$uibModal'];

export default FailModalService;
