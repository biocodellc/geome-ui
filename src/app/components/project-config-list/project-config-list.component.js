const template = require('./project-config-list.html');
const addTemplate = require('./add-field.html');

class ProjectConfigListController {
  constructor($mdDialog) {
    'ngInject';

    this.$mdDialog = $mdDialog;
  }

  $onInit() {
    this.orderBy = 'value';
  }

  $onChanges($changesObj) {
    if ('list' in $changesObj) {
      this.list = Object.assign({}, this.list);
      this.list.fields = this.list.fields.slice();
    }
  }

  removeField($event, field) {
    this.$mdDialog
      .show(
        this.$mdDialog
          .confirm()
          .textContent('Are you sure you want to delete this field?')
          .ok('Delete')
          .targetEvent($event)
          .cancel('Cancel'),
      )
      .then(() => {
        const i = this.list.field.indexOf(field);
        this.list.fields.splice(i, 1);
        this.handleChange();
      })
      .catch(() => {});
  }

  addField($event) {
    this.$mdDialog
      .show({
        template: addTemplate,
        locals: {
          field: {},
          existingFields: this.list.fields.map(f => f.value),
          $mdDialog: this.$mdDialog,
        },
        bindToController: true,
        controller: function Controller() {},
        controllerAs: '$ctrl',
        targetEvent: $event,
        autoWrap: false,
      })
      .then(field => {
        this.list.fields.push(field);
        this.handleChange();
      })
      .catch(() => {});
  }

  handleChange() {
    this.onChange({ list: this.list });
  }
}

export default {
  template,
  controller: ProjectConfigListController,
  bindings: {
    list: '<',
    canEdit: '<',
    onChange: '&',
  },
};
