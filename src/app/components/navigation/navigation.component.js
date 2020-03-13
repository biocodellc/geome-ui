const template = require('./navigation.html');

class NavigationController {
  constructor($state, ExpeditionService) {
    'ngInject';

    this.$state = $state;
    this.ExpeditionService = ExpeditionService;
  }

  $onChanges() {
    this.showProjectConfig =
      this.currentUser &&
      this.currentProject &&
      this.currentProject.projectConfiguration.user.userId ===
        this.currentUser.userId;

    this.showPhotoUpload =
      this.currentUser &&
      this.currentProject &&
      this.currentProject.config.entities.some(e => e.type === 'Photo');

    this.showPlateViewer =
      this.currentProject &&
      this.currentProject.config.entities.some(
        e => e.conceptAlias === 'Tissue' && e.uniqueKey === 'tissueID',
      );

    this.showSRAUpload =
      this.currentUser &&
      this.currentProject &&
      this.currentProject.config.entities.some(e => e.type === 'Fastq');
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
