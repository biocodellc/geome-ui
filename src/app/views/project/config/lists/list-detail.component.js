import angular from "angular";

import fimsConfigNavbar from '../navbar.component';
import fimsConfigField from './edit-field.component';

export class ListDetailController {
  constructor($state, ProjectConfigService, ConfirmationService, alerts) {
    'ngInject'
    this.$state = $state;
    this.alerts = alerts;
    this.ProjectConfigService = ProjectConfigService;
    this.ConfirmationService = ConfirmationService;
  }

  $onInit() {
    if (this.$state.params.addField) {
      this.newField();
    }
  }

  handleOnAdd() {
    this.newField();
  }

  handleOnSave() {
    this.alerts.removeTmp();
    this.ProjectConfigService.save(this.config, this.currentProject.projectId)
      .then((config) => {
        this.currentProject.config = config;
        this.alerts.success("Successfully updated project configuration!");
      }).catch((response) => {
      if (response.status === 400) {
        response.data.errors.forEach(error => this.alerts.error(error));
      }
    });
  }

  handleOnUpdate(index, field) {
    this.list.fields.splice(index, 1, field);
    this.checkEdited();
  }

  handleOnDelete(index) {
    this.ConfirmationService.confirm(
      `Are you sure you want to delete this field? <strong>This will only take effect for new data.</strong>`,
      () => {
        this.list.fields.splice(index, 1);
        this.checkEdited();
      });
  }

  handleToggleEdit(index) {
    if (this.editField === index) {
      delete this.editField;
    } else {
      this.editField = index;
    }
  }

  checkEdited() {
    const oldList = this.currentProject.config.lists.find(l => l.alias === this.list.alias);
    this.showSave = !angular.equals(oldList, this.list);
  }

  add() {
    delete this.editField;
    this.list.fields.push({
      isNew: true,
    });
  }

  newField() {
    this.list.fields.push({
      isNew: true,
    });
    this.editField = this.list.fields.length - 1;
  }
}

const fimsListDetail = {
  template: require('./list-detail.html'),
  controller: ListDetailController,
  bindings: {
    list: '<',
    currentProject: '<',
  },
};

export default angular.module('fims.projectConfigListDetail', [ fimsConfigNavbar, fimsConfigField ])
  .component('fimsListDetail', fimsListDetail)
  .name;