const template = require('./results.html');

class ResultsController {
  constructor(DataService) {
    'ngInject';

    this.DataService = DataService;
  }

  downloadFastqFiles() {
    if (!this.expeditionCode) {
      return;
    }

    this.DataService.generateSraData(this.projectId, this.expeditionCode);
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
