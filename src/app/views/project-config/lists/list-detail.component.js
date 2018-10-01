import angular from 'angular';

const template = require('./list-detail.html');

const fimsListDetail = {
  template,
  bindings: {
    list: '<',
  },
};

export default angular
  .module('fims.projectConfigListDetail', [])
  .component('fimsListDetail', fimsListDetail).name;
