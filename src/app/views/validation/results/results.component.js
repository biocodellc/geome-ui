const template = require('./results.html');

class ResultsController {
  constructor(DataService) {
    'ngInject';

    this.DataService = DataService;
  }

  downloadFastqFiles() {
    this.loading = true;
    if (!this.expeditionCode) {
      return;
    }

    this.DataService.generateSraData(
      this.projectId,
      this.expeditionCode,
    ).finally(() => {
      this.loading = false;
    });
  }
}

export default {
  template,
  controller: ResultsController,
  bindings: {
    results: '<',
    showGenbankDownload: '<',
    expeditionCode: '<',
    projectId: '<',
  },
};
