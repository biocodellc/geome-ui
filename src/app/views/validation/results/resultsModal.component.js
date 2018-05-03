const template = require('./resultsModal.html');

class ResultsModalController {
  $onInit() {
    // we have to do the following b/c uibModal doesn't resolve correctly
    this.results = this.resolve.results;
    this.onContinue = this.resolve.onContinue;
  }
}

export default {
  template,
  controller: ResultsModalController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
