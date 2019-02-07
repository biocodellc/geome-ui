const template = require('./uploadExpedition.html');

export default {
  template,
  bindings: {
    userExpeditions: '<',
    expeditionCode: '<',
    multiExpeditionAllowed: '<',
    canCreate: '<',
    isRequired: '<',
    onChange: '&',
  },
};
