const template = require('./header.html');

class HeaderController {
  constructor($location, $state) {
    'ngInject';

    this.$location = $location;
    this.$state = $state;
  }

  login() {
    this.$state.go('login', {
      nextState: this.$state.current.name,
      nextStateParams: this.$state.params,
    });
  }
}

export default {
  template,
  controller: HeaderController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
    onProjectChange: '&',
    onSignout: '&',
    showProjectSelector: '<',
  },
};
