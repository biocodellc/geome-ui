import angular from 'angular';

import fimsConfigNavbar from '../navbar.component';
import fimsConfigField from './edit-field.component';

const template = require('./list-detail.html');

export class ListDetailController {
  constructor(ConfirmationService) {
    'ngInject';

    this.ConfirmationService = ConfirmationService;
  }

  $onInit() {
    // make a copy of data we may edit
    this.list = Object.assign({}, this.list);
    this.list.fields = this.list.fields.slice();
    if (this.addField) {
      this.newField();
    }
  }

  handleOnAdd() {
    this.newField();
  }

  handleOnUpdate(index, field) {
    this.list.fields.splice(index, 1, field);
    this.onUpdateList({ alias: this.list.alias, list: this.list });
  }

  handleOnDelete(index) {
    this.ConfirmationService.confirm(
      `Are you sure you want to delete this field? <strong>This will only take effect for new data.</strong>`,
      () => {
        this.list.fields.splice(index, 1);
        this.onUpdateList({ alias: this.list.alias, list: this.list });
      },
    );
  }

  handleToggleEdit(index) {
    if (this.editField === index) {
      delete this.editField;
    } else {
      this.editField = index;
    }
  }

  add() {
    delete this.editField;
    this.newField();
  }

  newField() {
    this.list.fields.push({});
    this.editField = this.list.fields.length - 1;
  }
}

const fimsListDetail = {
  template,
  controller: ListDetailController,
  bindings: {
    list: '<',
    showSave: '<',
    addField: '<',
    onSave: '&',
    onUpdateList: '&',
  },
};

export default angular
  .module('fims.projectConfigListDetail', [fimsConfigNavbar, fimsConfigField])
  .component('fimsListDetail', fimsListDetail).name;
