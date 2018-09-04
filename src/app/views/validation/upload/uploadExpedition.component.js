const template = require('./uploadExpedition.html');

export default {
  template,
  bindings: {
    userExpeditions: '<',
    expeditionCode: '<',
    multiExpeditionAllowed: '<',
    onChange: '&',
  },
};
