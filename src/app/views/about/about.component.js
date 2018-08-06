const template = require('./about.html');

class AboutController {
  constructor($state) {
    'ngInject';

    this.$state = $state;
  }
}

export default {
  template,
  controller: AboutController,
  bindings: {
    layout: '@',
  },
};
