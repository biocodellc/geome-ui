import angular from 'angular';
import { QueryBuilder } from '../query/Query';

const template = require('./plate-viewer.html');
const viewPlateTemplate = require('./plate-viewer-dialog.html');
const newPlateTemplate = require('./new-plate-dialog.html');

const NEW_PLATE = {
  A: [],
  B: [],
  C: [],
  D: [],
  E: [],
  F: [],
  G: [],
  H: [],
};

class PlateViewerController {
  constructor(
    $mdDialog,
    QueryService,
    PlateService,
    plateName,
    plateData,
    currentProject,
    canEdit,
    newPlate,
    expeditions,
  ) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.QueryService = QueryService;
    this.PlateService = PlateService;
    this.plateName = plateName;
    this.origPlateData = plateData;
    this.plateData = angular.copy(plateData);
    this.currentProject = currentProject;
    this.canEdit = canEdit;
    this.newPlate = newPlate || false;
    this.expeditions = expeditions;

    this.searchTexts = {};
    this.editedData = {};
    this.hasChanges = false;
  }

  dataChanged(row, column) {
    this.hasChanges = !angular.equals(this.origPlateData, this.plateData);
    if (!this.editedData[row]) {
      this.editedData[row] = {};
    }
    this.editedData[row][column] = !!this.plateData[row][column];
  }

  // eslint-disable-next-line class-methods-use-this
  getWell(row, column) {
    return `${row}${column + 1}`;
  }

  save() {
    this.isSaving = true;
    const p = this.newPlate
      ? this.PlateService.create(
          this.currentProject.projectId,
          this.plateName,
          this.plateData,
        )
      : this.PlateService.save(
          this.currentProject.projectId,
          this.plateName,
          this.plateData,
        );

    p
      .then(resp => {
        this.errors = resp.validationMessages
          ? resp.validationMessages.errors.reduce(
              (accumulator, group) =>
                accumulator.concat(group.messages.map(g => g.message)),
              [],
            )
          : undefined;
        if (resp.plate) {
          angular.toaster.success(
            `Successfully ${this.newPlate ? 'created' : 'updated'} the plate.`,
          );

          Object.keys(resp.plate).forEach(row =>
            resp.plate[row].forEach((val, col) => {
              this.plateData[row][col] = val;
              if (this.editedData[row]) {
                this.editedData[row][col] = false;
              }
            }),
          );
        }
        this.newPlate = this.newPlate && !!resp.plate;
        this.origPlateData = resp.plate || angular.copy(NEW_PLATE);
        this.hasChanges = !angular.equals(this.origPlateData, this.plateData);
      })
      .finally(() => (this.isSaving = false));
  }

  query(row, column) {
    const searchText = this.searchTexts[row][column];
    const entity = this.currentProject.config.entities.find(
      e => e.conceptAlias === 'Tissue',
    );

    const parentEntity = this.currentProject.config.entities.find(
      e => e.conceptAlias === entity.parentEntity,
    );

    const builder = new QueryBuilder();
    builder.add(
      `_projects_:${
        this.currentProject.projectId
      } AND _expeditions_:[${this.expeditions.join()}] AND ${
        parentEntity.conceptAlias
      }.${parentEntity.uniqueKey}::"%${searchText}%"`,
    );

    builder.setSource([parentEntity.uniqueKey, 'expeditionCode'].join());

    return this.QueryService.queryJson(
      builder.build(),
      parentEntity.conceptAlias,
      0,
      100,
      false,
    ).then(resp => resp.data);
  }
}

class PlatesController {
  constructor(
    $mdDialog,
    $state,
    PlateService,
    ExpeditionService,
    QueryService,
  ) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.$state = $state;
    this.PlateService = PlateService;
    this.ExpeditionService = ExpeditionService;
    this.QueryService = QueryService;
    this.hasExpeditions = false;
    this.validationMessages = {};
  }

  $onChanges(changesObj) {
    if (
      this.currentProject &&
      'currentProject' in changesObj &&
      changesObj.currentProject.previousValue !== this.currentProject
    ) {
      if (
        !this.currentProject.config.entities.some(
          e => e.conceptAlias === 'Tissue' && e.uniqueKey === 'tissueID',
        )
      ) {
        this.$state.go('validate');
      }
      this.plates = [];
      this.plateData = undefined;
      this.fetchPlates();
      if (this.currentUser) {
        this.fetchExpeditions();
      }
    }

    if (
      'currentUser' in changesObj &&
      changesObj.currentUser.previousValue !== this.currentUser
    ) {
      this.fetchExpeditions();
    }
  }

  viewPlate() {
    this.$mdDialog
      .show({
        template: viewPlateTemplate,
        locals: {
          plateName: this.plate,
          plateData: this.isNewPlate ? angular.copy(NEW_PLATE) : this.plateData,
          $mdDialog: this.$mdDialog,
          QueryService: this.QueryService,
          PlateService: this.PlateService,
          currentProject: this.currentProject,
          canEdit: !!this.currentUser,
          newPlate: this.isNewPlate,
        },
        resolve: {
          expeditions: () => this.expeditionPromise,
        },
        controller: PlateViewerController,
        controllerAs: '$ctrl',
        escapeToClose: !this.currentUser,
        autoWrap: false,
      })
      .then(() => {
        if (this.isNewPlate) {
          this.plates.push(this.plate);
          this.isNewPlate = false;
        }
      })
      .catch(() => {
        if (this.isNewPlate) {
          this.plate = undefined;
          this.isNewPlate = false;
        }
      });
  }

  clearSearchText() {
    if (this.plate) {
      this.searchText = '';
    }
  }

  newPlate(ev) {
    this.$mdDialog
      .show({
        targetEvent: ev,
        template: newPlateTemplate,
        locals: {
          plates: this.plates,
          $mdDialog: this.$mdDialog,
        },
        bindToController: true,
        controller: function Controller() {
          this.create = () => {
            if (this.plates.find(p => p === this.plate)) {
              this.error = true;
              return;
            }
            this.$mdDialog.hide(this.plate);
          };
        },
        controllerAs: '$ctrl',
        autoWrap: false,
      })
      .then(name => {
        this.isNewPlate = true;
        // setting this.plate should happen last b/c viewPlate will be called as soon as the val is set
        this.plate = name;
      })
      .catch(() => {});
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

  fetchExpeditions() {
    if (!this.currentUser || !this.currentProject || this.loadingExpeditions) {
      if (!this.loadingExpeditions) {
        this.expeditionPromise = Promise.resolve([]);
      }
      return;
    }

    this.loadingExpeditions = true;

    const p =
      this.currentProject.user.userId === this.currentUser.userId
        ? this.ExpeditionService.getExpeditionsForAdmin(
            this.currentProject.projectId,
          )
        : this.ExpeditionService.getExpeditionsForUser(
            this.currentProject.projectId,
            true,
          );

    this.expeditionPromise = p
      .then(resp => {
        this.hasExpeditions = resp.data.length > 0;
        return resp.data.map(e => e.expeditionCode);
      })
      .finally(() => (this.loadingExpeditions = false));
  }
}

export default {
  template,
  controller: PlatesController,
  bindings: {
    currentProject: '<',
    currentUser: '<',
  },
};
