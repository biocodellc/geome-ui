const template = require('./navigation.html');

class NavigationController {
  constructor($state, ExpeditionService) {
    'ngInject';

    this.$state = $state;
    this.ExpeditionService = ExpeditionService;
  }

  $onChanges(changesObj) {
    if (
      this.currentUser &&
      this.currentProject &&
      'currentProject' in changesObj
    ) {
      this.ExpeditionService.getExpeditionsForUser(
        this.currentProject.projectId,
        true,
      )
        .then(({ data }) => {
          this.data = data;
        })
        .then(() => {
          if (
            this.data.length <= 0 &&
            this.$state.current.name === 'expeditions.list'
          ) {
            this.$state.go('dashboard');
          }
        });
    }

    this.showPhotoUpload =
      this.currentUser &&
      this.currentProject &&
      this.currentProject.config.entities.some(e => e.type === 'Photo');

    this.showPlateViewer =
      this.currentProject &&
      this.currentProject.config.entities.some(
        e => e.conceptAlias === 'Tissue' && e.uniqueKey === 'tissueID',
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
