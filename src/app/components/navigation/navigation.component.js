const template = require('./navigation.html');

class NavigationController {
  constructor($state, ExpeditionService, $mdMedia) {
    'ngInject';

    this.$state = $state;
    this.$mdMedia = $mdMedia;
    this.ExpeditionService = ExpeditionService;
  }
  $onInit() {
    this.showNav = false;
  }

  $onChanges() {
    if (this.currentUser && this.currentProject) {
      this.ExpeditionService.getExpeditionsForUser(
        this.currentProject.projectId,
        true,
      ).then(({ data }) => {
        this.showMyExpeditions = data.length > 0;
      });
    }

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
  toggleNav() {
    this.showNav = !this.showNav;
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
