import angular from 'angular';

const template = require('./expeditions.html');

const fimsExpeditionsList = {
  template,
  bindings: {
    expeditions: '<',
  },
};

export default angular
  .module('fims.fimsExpeditionsList', [])
  .component('fimsExpeditionsList', fimsExpeditionsList).name;
