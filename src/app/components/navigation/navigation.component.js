const template = require('./navigation.html');

class NavigationController {
  constructor($state) {
    'ngInject';

    this.$state = $state;
  }

  $onChanges() {
    this.showPhotoUpload =
      this.currentUser &&
      this.currentProject &&
      this.currentProject.config.entities.some(e => e.type === 'Photo');

    this.showPlateViewer =
      this.currentProject &&
      this.currentProject.config.entities.some(
        e => e.conceptAlias === 'Tissue',
      );
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
