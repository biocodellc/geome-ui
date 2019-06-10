const template = require('./project-config-expedition-metadata.html');
const editTemplate = require('./edit-property.html');

const PROPERTY_TYPES = ['STRING', 'LIST', 'BOOLEAN'];

class ProjectConfigExpeditionMetadataController {
  constructor($mdDialog) {
    'ngInject';

    this.$mdDialog = $mdDialog;
  }

  $onInit() {
    this.properties = this.properties.map(p => Object.assign({}, p));
    this.orderBy = 'name';
  }

  handleChange() {
    this.onChange({ properties: this.properties });
  }

  deleteProperty($event, prop) {
    this.$mdDialog
      .show(
        this.$mdDialog
          .confirm()
          .textContent('Are you sure you want to delete this property?')
          .ok('Delete')
          .targetEvent($event)
          .cancel('Cancel'),
      )
      .then(() => {
        const i = this.properties.indexOf(prop);
        this.properties.splice(i, 1);
        this.handleChange();
      })
      .catch(() => {});
  }

  editProperty($event, property) {
    if (!property.values) property.values = [];
    this.$mdDialog
      .show({
        template: editTemplate,
        locals: {
          property: angular.copy(property),
          propertyTypes: PROPERTY_TYPES,
          $mdDialog: this.$mdDialog,
        },
        bindToController: true,
        controller: function Controller() {},
        controllerAs: '$ctrl',
        targetEvent: $event,
        autoWrap: false,
      })
      .then(p => {
        if (p.values && p.values.length === 0) delete p.values;
        const i = this.properties.indexOf(property);
        this.properties.splice(i, 1, p);
        this.handleChange();
      })
      .catch(() => {
        const i = this.properties.indexOf(property);
        if (!this.properties[i].name) this.properties.splice(i, 1);
      });
  }

  addProperty($event) {
    const p = {
      name: undefined,
      required: false,
      type: 'STRING',
      values: [],
    };
    this.properties.push(p);
    this.editProperty($event, p);
  }
}

export default {
  template,
  controller: ProjectConfigExpeditionMetadataController,
  bindings: {
    properties: '<',
    onChange: '&',
  },
};
