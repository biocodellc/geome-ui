import angular from 'angular';

const template = require('./expeditions.html');

class ExpeditionsController {
  constructor(UserService) {
    'ngInject';

    this.UserService = UserService;
  }
}

const fimsExpeditionsList = {
  template,
  controller: ExpeditionsController,
  bindings: {
    expeditions: '<',
  },
};

export default angular
  .module('fims.fimsExpeditionsList', [])
  .component('fimsExpeditionsList', fimsExpeditionsList).name;
