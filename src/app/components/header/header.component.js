import config from '../../utils/config';

const template = require('./header.html');

const { restRoot } = config;

class HeaderController {
  constructor($location, $state) {
    'ngInject';

    this.$location = $location;
    this.$state = $state;
  }

  $onInit() {
    this.restRoot = restRoot;
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
