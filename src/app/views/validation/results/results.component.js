class ResultsController {
  constructor($window, REST_ROOT) {
    'ngInject';

    this.$window = $window;
    this.REST_ROOT = REST_ROOT;
  }

  downloadFastqFiles() {
    if (!this.expeditionCode) {
      return;
    }
    // TODO use file service & another service for generateSraFiles?
    this.$window.open(`${this.REST_ROOT}projects/${this.projectId}/expeditions/${this.expeditionCode}/generateSraFiles`, "_self");
  }
}

export default {
  template: require('./results.html'),
  controller: ResultsController,
  bindings: {
    results: '<',
    showGenbankDownload: '<',
    expeditionCode: '<',
    projectId: '<',
  },
};
