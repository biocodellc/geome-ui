const template = require('./about.html');

class AboutController {
  constructor($state, $location) {
    'ngInject';

    this.$state = $state;
    this.$location = $location;
  }

  openProjects($event) {
    $event.preventDefault();
    this.$location.hash('projects');
    this.$onChanges();
  }

  $onChanges() {
    const accordionSection = this.$location.hash();
    if (accordionSection === 'userHelp') this.userHelp = true;
    else if (accordionSection === 'projects') this.projects = true;
    else if (accordionSection === 'dataPolicy') this.dataPolicy = true;
    else this.gettingStarted = true;
  }
}

export default {
  template,
  controller: AboutController,
  bindings: {
    layout: '@',
  },
};
