export default class ExpeditionsController {
  constructor(ExpeditionService, expeditions) {
    'ngInject';
    this.expeditions = expeditions;
    this.ExpeditionService = ExpeditionService; // TODO do I need this?
  }
}

