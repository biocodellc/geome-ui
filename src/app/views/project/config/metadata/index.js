import angular from 'angular';


class MetadataController {
  $onInit() {
    this.config = Object.assign({}, this.config);
  }
}

const fimsProjectConfigMetadata = {
  template: require('./config-metadata.html'),
  controller: MetadataController,
  bindings: {
    config: '<',
    onUpdate: '&'
  },
};

export default angular.module('fims.projectConfigMetadata', [])
  .component('fimsProjectConfigMetadata', fimsProjectConfigMetadata)
  .name;
