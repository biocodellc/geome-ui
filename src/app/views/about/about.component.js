const template = require('./about.html');

class AboutController {
  constructor($scope, $state, $location) {
    'ngInject';

    this.$state = $state;
    this.$location = $location;

    // force resize of project-info md-virtual-repeat after the accordion has been opened
    // if we don't do this, the virtual-repeat attempts to size from a base of 0 (hidden dom)
    const watcher = $scope.$watch(
      () => this.projects,
      () => {
        if (this.projects) {
          $scope.$broadcast('$md-resize');
          // we only need to do this the first time it opens,
          // so we can unregister the watcher
          watcher();
        }
      },
    );
  }

  openProjects() {
    this.$location.hash('projects');
    this.$onChanges();
  }

  $onChanges() {
    const accordionSection = this.$location.hash();
    if (accordionSection === 'userHelp') this.userHelp = true;
    else if (accordionSection === 'projects') this.projects = true;
    else if (accordionSection === 'dataPolicy') this.dataPolicy = true;
  }
}

export default {
  template,
  controller: AboutController,
  bindings: {
    layout: '@',
  },
};
