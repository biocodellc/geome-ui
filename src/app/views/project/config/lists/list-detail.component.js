import angular from 'angular';

import fimsConfigNavbar from '../navbar.component';
import fimsConfigField from './edit-field.component';

export class ListDetailController {
  constructor(ConfirmationService) {
    'ngInject';

    this.ConfirmationService = ConfirmationService;
  }

  $onInit() {
    this.list = Object.assign({}, this.list);
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
    showSave: '<',
    addField: '<',
    onSave: '&',
    onUpdateList: '&',
  },
};

export default angular
  .module('fims.projectConfigListDetail', [fimsConfigNavbar, fimsConfigField])
  .component('fimsListDetail', fimsListDetail).name;
