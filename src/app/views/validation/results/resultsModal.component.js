//TODO use componet close & dismiss
class ResultsModalController {
  constructor($uibModalInstance) {
    'ngInject';

    console.log(this);
    this.$uibModalInstance = $uibModalInstance;
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  close() {
    this.$uibModalInstance.close();
  }
}

export default {
  template: require('./resultsModal.html'),
  controller: ResultsModalController,
  bindings: {
    results: '<',
    onContinue: '&',
  },
};
