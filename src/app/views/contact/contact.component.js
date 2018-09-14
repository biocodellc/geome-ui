const template = require('./contact.html');

class contactController {
  constructor($location) {
    'ngInject';

    this.$location = $location;
  }

  go() {
    this.$location.path('/about').hash('userHelp');
  }
}
export default {
  template,
  controller: contactController,
};
