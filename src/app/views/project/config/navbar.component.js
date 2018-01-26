import angular from 'angular';

const fimsProjectConfigNavbar = {
  template: require('./navbar.html'),
  transclude: true,
  bindings: {
    showSave: '<',
    addText: '<',
    onSave: '&',
    onAdd: '&',
  },
};

export default angular
  .module('fims.projectConfigNavbar', [])
  .component('fimsProjectConfigNavbar', fimsProjectConfigNavbar).name;
