import angular from "angular";
import { FimsExpeditionController } from "./FimsExpeditionController";

export class ExpeditionController extends FimsExpeditionController {
  constructor($state, ExpeditionService, DataService, alerts, $uibModal) {
    'ngInject';
    super($uibModal, $state, ExpeditionService, DataService);

    this.alerts = alerts;
  }

  handleExpeditionUpdate(expedition) {
    if (!angular.equals(this.expedition, expedition)) {
      this.ExpeditionService.update(expedition)
        .then(() => {
          this.alerts.success("Successfully updated!");
          this.$state.reload();
        });
    } else {
      this.alerts.success("Successfully updated!");
    }
  }

  handleExpeditionDelete() {
    super.deleteExpedition(this.expedition)
      .then(() => this.$state.go(this.backState, {}, { reload: true, inherit: false }));
  }
}

const fimsExpedition = {
  template: require('./expedition.html'),
  controller: ExpeditionController,
  bindings: {
    backState: '<',
    expedition: '<',
  },
};

export default angular.module('fims.fimsExpedition', [])
  .component('fimsExpedition', fimsExpedition)
  .name;
