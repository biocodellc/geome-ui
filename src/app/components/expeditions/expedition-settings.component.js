import angular from "angular";

export default class ExpeditionSettingsController {
  $ngInit() {
    this.visibilities = [ "anyone", "project members", "expedition members" ];
    this.expedition = Object.assign({}, this.expedition);
  }
}


const fimsExpeditionSettings = {
  template: require('./expedition-settings.html'),
  controller: ExpeditionSettingsController,
  bindings: {
    backState: '<',
    expedition: '<',
    onUpdate: '&',
    onDelete: '&',
    onExportData: '&',
  },
};

export default angular.module('fims.fimsExpeditionSettings', [])
  .component('fimsExpeditionSettings', fimsExpeditionSettings)
  .name;
