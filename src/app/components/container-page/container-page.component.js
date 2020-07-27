const template = require('./container-page.html');

export default {
  template,
  bindings: {
    layout: '@',
    currentUser: '<',
    currentProject: '<',
  },
};
