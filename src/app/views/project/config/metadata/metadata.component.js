class MetadataController {
  $onInit() {
    this.config = Object.assign({}, this.config);
  }
}

export default {
  template: require('./config-metadata.html'),
  controller: MetadataController,
  bindings: {
    config: '<',
    onUpdate: '&',
  },
};