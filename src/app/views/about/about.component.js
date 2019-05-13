const template = require('./about.html');

class AboutController {
  constructor($state, $location, $anchorScroll) {
    'ngInject';

    this.$state = $state;
    this.$location = $location;
    this.$anchorScroll = $anchorScroll;
  }

  openSections($event, page) {
    $event.preventDefault();
    this.$location.hash(page);
    this.$onChanges();
    this.$anchorScroll();
  }

  $onChanges() {
    const accordionSection = this.$location.hash();
    if (accordionSection === 'userHelp') this.userHelp = true;
    else if (accordionSection === 'subscriptions') this.subscriptions = true;
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
