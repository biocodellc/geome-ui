import angular from 'angular';


const fimsProjectConfigMetadata = {
  template: require('./config-metadata.html'),
  bindings: {
    config: '<',
  },
};

export default angular.module('fims.projectConfigMetadata', [])
  .component('fimsProjectConfigMetadata', fimsProjectConfigMetadata)
  .name;
