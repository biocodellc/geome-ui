import angular from 'angular';

import visibilities from './ExpeditionVisibilities';

const template = require('./expedition-settings.html');

class ExpeditionSettingsController {
  $onInit() {
    this.visibilities = visibilities;
    this.expedition = angular.copy(this.expedition);
    this.hasMetadata =
      Object.keys(this.currentProject.config.expeditionMetadataProperties)
        .length > 0;
  }
}

const fimsExpeditionSettings = {
  template,
  controller: ExpeditionSettingsController,
  bindings: {
    backState: '<',
    expedition: '<',
    currentProject: '<',
    onUpdate: '&',
    onDelete: '&',
    onExportData: '&',
  },
};

export default angular
  .module('fims.fimsExpeditionSettings', [])
  .component('fimsExpeditionSettings', fimsExpeditionSettings).name;
