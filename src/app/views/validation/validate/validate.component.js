const template = require('./validate.html');

export default {
  template,
  bindings: {
    fimsMetadata: '<',
    onMetadataChange: '&',
    onValidate: '&',
  },
};
