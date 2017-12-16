import angular from 'angular';

import projectSelector from '../project-selector';


class HeaderController {
  constructor($location, $window, $state) {
    'ngInject';

    this.$location = $location;
    this.$window = $window;
    this.$state = $state;
  }

  apidocs() {
    const url = this.$location.$$absUrl.replace(this.$location.path(), "/apidocs/current/service.json");
    this.$window.location = `http://biscicol.org/apidocs?url=${url}`;
  }

  login() {
    this.$state.go('login', { nextState: this.$state.current.name, nextStateParams: this.$state.params });
  }
}

const header = {
  template: require('./header.html'),
  controller: HeaderController,
  bindings: {
    currentUser: "<",
    currentProject: "<",
    onProjectChange: "&",
    onSignout: "&",
  },
};

export default angular.module('fims.header', [ projectSelector ])
  .component('fimsHeader', header)
  .name;
