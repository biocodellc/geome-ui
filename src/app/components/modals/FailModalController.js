class FailModalController {
  constructor($uibModalInstance, message, title) {
    this.message = message;
    this.title = title;
    this.$uibModalInstance = $uibModalInstance;
  }

  ok() {
    this.$uibModalInstance.dismiss('cancel');
  }
}

FailModalController.$inject = ['$uibModal', 'message', 'title'];
export default FailModalController;
