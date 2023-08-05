import angular from 'angular';
import { QueryBuilder } from '../query/Query';

const template = require('./plate-viewer.html');
const viewPlateTemplate = require('./plate-viewer-dialog.html');
const newPlateTemplate = require('./new-plate-dialog.html');
const tissueDialogTemplate = require('./tissue-dialog.html');

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
    RecordService,
    plateName,
    plateData,
    currentProject,
    currentUser,
    canEdit,
    newPlate,
	enableEditing,
  ) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.QueryService = QueryService;
    this.PlateService = PlateService;
    this.RecordService = RecordService;
    this.plateName = plateName;
    this.origPlateData = plateData;
    this.plateData = angular.copy(plateData);
    this.currentProject = currentProject;
    this.currentUser = currentUser;
    this.canEdit = canEdit;
    this.enableEditing = false;
    this.newPlate = newPlate || false;

    this.searchTexts = {};
    this.editedData = {};
    this.hasChanges = false;

    const { config } = this.currentProject;
    const tissueEntity = config.entities.find(e => e.conceptAlias === 'Tissue');
    const sampleEntity = config.entities.find(e => e.conceptAlias === 'Sample');
    this.metadataColumns = Array.from(
      new Set(
        tissueEntity.attributes
          .map(a => a.column)
          .concat(sampleEntity.attributes.map(a => a.column)),
      ),
    );
    this.nonBaseTissueAttributes = tissueEntity.attributes.filter(
      a =>
        !['tissueID', 'tissueWell', 'tissuePlate', 'materialSampleID'].includes(
          a.column,
        ),
    );
    this.metadataColumns.sort();
  }

  toggleEditing () {
  	if (this.enableEditing) {
		this.enableEditing = false;
	} else {
		this.enableEditing = true;
	}
  }
  canDelete(row, column) {
    if (!this.canEdit) return false;

    const t = this.plateData[row][column];
    return t && t.tissueID;
  }

  dataChanged(row, column) {
    this.hasChanges = !angular.equals(this.origPlateData, this.plateData);
    if (!this.editedData[row]) {
      this.editedData[row] = {};
    }
    this.editedData[row][column] = !!this.plateData[row][column];
  }

  getValue(row, column) {
    return this.plateData[row][column][this.displayColumn] || 'N/A';
  }
  getValue2(row, column) {
    return this.plateData[row][column][this.displayColumn2] || 'N/A';
  }
  getValue3(row, column) {
    return this.plateData[row][column][this.displayColumn3] || 'N/A';
  }

  // eslint-disable-next-line class-methods-use-this
  getWell(row, column) {
    return `${row}${column + 1}`;
  }

  tissueDetails(tissue) {
    if (!tissue || !tissue.tissueID) return;
    // make backdrop cover plate viewer
    angular
      .element(document.querySelector('.md-dialog-backdrop'))
      .css('z-index', 82);
    this.$mdDialog
      .show({
        template: tissueDialogTemplate,
        locals: {
          tissue,
          $mdDialog: this.$mdDialog,
        },
        bindToController: true,
        controller: function Controller() {
          this.tissueData = () => {
            if (this.cachedData) return this.cachedData;
            this.cachedData = Object.keys(this.tissue).map(key => ({
              key,
              value: this.tissue[key],
            }));
            return this.cachedData;
          };
        },
        controllerAs: '$ctrl',
        clickOutsideToClose: true,
        escapeToClose: true,
        autoWrap: false,
        multiple: true,
        onShowing: (scope, el) => el.css('z-index', 85),
      })
      .catch(() => {})
      .finally(() =>
        angular
          .element(document.querySelector('.md-dialog-backdrop'))
          .css('z-index', 79),
      );
  }

  deleteTissue(row, column) {
    const t = this.plateData[row][column];

    const remove = () => {
      delete this.plateData[row][column];
      this.RecordService.delete(t.bcid)
        .then(() => {
          // new plate if there are no more tissues
          this.newPlate = !Object.keys(this.plateData).some(r =>
            Object.keys(this.plateData[r]).some(c => this.plateData[r][c]),
          );
        })
        .catch(e => {
          angular.catcher('Failed to delete tissue')(e);
          this.plateData[row][column] = t;
        });
    };

    // when we create a new tissue in a plate, we only create
    // a few attributes ('materialSampleID', 'tissueID', 'tissuePlate', 'tissueWell')
    // if the tissue contains more then these keys, inform the user
    if (this.nonBaseTissueAttributes.some(a => !!t[a.column])) {
      this.$mdDialog
        .show(
          this.$mdDialog
            .confirm()
            .htmlContent(
              `This tissue contains additional metadata. If you delete this tissue,
               the metadata will be lost. To preserve the metadata, re-upload the tissue
               via a spreadsheet, and alter the tissuePlate and/or tissueWell columns.
               <br/><br/><strong>Are you sure you want to delete it?</strong>`,
            )
            .title('Delete Tissue?')
            .css('confirmation-dialog')
            .multiple(true)
            .ok('Delete')
            .cancel('Cancel'),
        )
        .then(() => {
          remove();
        })
        .catch(() => {});
    } else {
      remove();
    }
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

    p.then(resp => {
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
      this.newPlate = this.newPlate && !resp.plate;
      this.origPlateData = resp.plate || angular.copy(NEW_PLATE);
      this.hasChanges = !angular.equals(this.origPlateData, this.plateData);
      this.searchTexts = {};
    }).finally(() => {
      this.isSaving = false;
    });
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
      `_projects_:${this.currentProject.projectId} AND ${
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
    RecordService,
    ExpeditionService,
    QueryService,
  ) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.$state = $state;
    this.PlateService = PlateService;
    this.RecordService = RecordService;
    this.ExpeditionService = ExpeditionService;
    this.QueryService = QueryService;
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
      this.hashedSample = this.currentProject.config.entities.some(
        e => e.conceptAlias === 'Sample' && e.hashed,
      );
      this.fetchPlates();
    }
  }

  viewPlate() {
    this.$mdDialog
      .show({
        componentId: 'plateDialog',
        template: viewPlateTemplate,
        locals: {
          plateName: this.plate,
          plateData: this.isNewPlate ? angular.copy(NEW_PLATE) : this.plateData,
          $mdDialog: this.$mdDialog,
          QueryService: this.QueryService,
          PlateService: this.PlateService,
          RecordService: this.RecordService,
          currentProject: this.currentProject,
          currentUser: this.currentUser,
          canEdit:
            this.currentProject.currentUserIsMember && !this.hashedSample,
          newPlate: this.isNewPlate,
		  enableEditing: this.enableEditing,
        },
        controller: PlateViewerController,
        controllerAs: '$ctrl',
        escapeToClose: !this.currentUser,
        autoWrap: false,
      })
      .then(plateData => {
        this.plateData = plateData;
        if (this.isNewPlate) {
          this.plates.push(this.plate);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (this.isNewPlate) {
          this.fetchPlates();
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
    if (this.hashedSample) return;
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
        this.plate = name;
        this.viewPlate();
      })
      .catch(() => {});
  }

  fetchPlate() {
    if (this.plate && !this.isNewPlate) {
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
        if (this.plate && !plates.includes(this.plate)) this.plate = undefined;
        this.plates = plates.sort();
      })
      .finally(() => (this.loading = false));
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
