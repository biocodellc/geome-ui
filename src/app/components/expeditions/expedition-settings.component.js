import angular from 'angular';

import visibilities from './ExpeditionVisibilities';

const template = require('./expedition-settings.html');

class ExpeditionSettingsController {
  $onInit() {
    this.visibilities = visibilities;
    this.expedition = Object.assign({}, this.expedition);
  }
}

const fimsExpeditionSettings = {
  template,
  controller: ExpeditionSettingsController,
  bindings: {
    backState: '<',
    expedition: '<',
    onUpdate: '&',
    onDelete: '&',
    onExportData: '&',
  },
};

export default angular
  .module('fims.fimsExpeditionSettings', [])
  .component('fimsExpeditionSettings', fimsExpeditionSettings).name;
