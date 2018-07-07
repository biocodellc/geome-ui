import '../../../style/fims/_about.scss';

const template = require('./about.html');

class AboutController {
  constructor($state, $anchorScroll) {
    'ngInject';

    this.$state = $state;
    this.$anchorScroll = $anchorScroll;
  }
}

export default {
  template,
  controller: AboutController,
  bindings: {
    layout: '@',
  },
};
