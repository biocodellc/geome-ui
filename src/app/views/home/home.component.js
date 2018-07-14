import '../../../style/fims/_home.scss';

const template = require('./home.html');

class HomeController {
  constructor($state) {
    'ngInject';

    this.$state = $state;
  }
}

export default {
  template,
  controller: HomeController,
  bindings: {
    layout: '@',
  },
};
