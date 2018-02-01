import angular from 'angular';

import config from '../../../utils/config';
const { restRoot } = config;

const template = require('./results.html');

class ResultsController {
  constructor($window) {
    'ngInject';

    this.$window = $window;
  }

  downloadFastqFiles() {
    if (!this.expeditionCode) {
      return;
    }
    // TODO use file service & another service for generateSraFiles?
    this.$window.open(
      `${restRoot}projects/${this.projectId}/expeditions/${
        this.expeditionCode
      }/generateSraFiles`,
      '_self',
    );
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
