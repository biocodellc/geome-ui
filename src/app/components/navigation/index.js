import angular from 'angular';


class NavCtrl {
}

const navigation = {
  template: require('./navigation.html'),
  controller: NavCtrl,
  bindings: {
    currentUser: "<",
    currentProject: "<",
  },
};

export default angular.module('fims.navigation', [])
  .component('fimsNavigation', navigation)
  .name;
