export default {
  template: require('./validate.html'),
  bindings: {
    fimsMetadata: '<',
    onMetadataChange: '&',
    onValidate: '&',
  },
};
