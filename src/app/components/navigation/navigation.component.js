const template = require('./navigation.html');

class NavigationController {
  constructor($state) {
    'ngInject';

    this.$state = $state;
  }
}

export default {
  template,
  controller: NavigationController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};
