import angular from "angular";

const fimsExpeditionsList = {
  template: require('./expeditions.html'),
  bindings: {
    expeditions: '<',
  },
};

export default angular.module('fims.fimsExpeditionsList', [])
  .component('fimsExpeditionsList', fimsExpeditionsList)
  .name;
