import angular from 'angular';

const fimsExpeditionResources = {
  template: require('./expedition-resources.html'),
  bindings: {
    expedition: '<',
  },
};

export default angular
  .module('fims.fimsExpeditionResources', [])
  .component('fimsExpeditionResources', fimsExpeditionResources).name;
