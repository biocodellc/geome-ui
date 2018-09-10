const template = require('./plate-viewer.html');
const plateTemplate = require('./plate-viewer-dialog.html');

class PhotoUploadController {
  constructor($mdDialog, PlateService) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.PlateService = PlateService;
  }

  $onChanges(changesObj) {
    if (
      this.currentProject &&
      'currentProject' in changesObj &&
      changesObj.currentProject.previousValue !== this.currentProject
    ) {
      this.plates = [];
      this.plateData = undefined;
      this.fetchPlates();
    }
  }

  viewPlate() {
    this.$mdDialog.show({
      template: plateTemplate,
      locals: {
        plateName: this.plate,
        plateData: this.plateData,
        $mdDialog: this.$mdDialog,
      },
      bindToController: true,
      controller: function Controller() {},
      controllerAs: '$ctrl',
      autoWrap: false,
    });
  }

  clearSearchText() {
    if (this.plate) {
      this.searchText = '';
    }
  }

  fetchPlate() {
    if (this.plate) {
      this.loadingPlate = true;
      this.PlateService.get(this.currentProject.projectId, this.plate)
        .then(plateData => {
          this.plateData = plateData;
          this.viewPlate();
        })
        .finally(() => (this.loadingPlate = false));
    } else {
      this.plateData = undefined;
    }
  }

  fetchPlates() {
    this.loading = true;
    this.PlateService.all(this.currentProject.projectId)
      .then(plates => {
        this.plates = plates.sort();
        if (this.plates.length === 1) {
          this.plate = this.plates[0];
          this.fetchPlate();
        }
      })
      .finally(() => (this.loading = false));
  }
}

export default {
  template,
  controller: PhotoUploadController,
  bindings: {
    currentProject: '<',
  },
};
