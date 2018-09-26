const template = require('./project-config-attributes.html');
const editTemplate = require('./edit-attribute.html');

class ProjectConfigAttributesController {
  constructor($scope, $filter, $mdDialog) {
    'ngInject';

    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    $scope.$watchCollection('$ctrl.selected', (newVal, oldVal) => {
      // call handleChange if an attribute was selected/deselected
      if (newVal && oldVal && newVal.length !== oldVal.length) {
        this.handleChange();
      }
    });
  }

  $onInit() {
    this.selected = this.selected.map(a => Object.assign({}, a));
    this.orderBy = 'required';
  }

  $onChanges(changesObj) {
    if ('required' in changesObj) {
      this.requiredUris = this.required.map(a => a.uri);
    }
  }

  getAvailable() {
    if (this.orderBy === 'required' || this.orderBy === '-required') {
      const isDesc = this.orderBy === '-required';
      return this.available.slice().sort((a, b) => {
        if (this.requiredUris.includes(a.uri)) {
          if (this.requiredUris.includes(b.uri)) return 0;
          return isDesc ? 1 : -1;
        } else if (this.requiredUris.includes(b.uri)) return isDesc ? -1 : 1;
        return 0;
      });
    }

    return this.$filter('orderBy')(this.available, this.orderBy);
  }

  editAttribute($event, attribute) {
    // prevent auto-select from selecting the row
    $event.stopPropagation();

    this.$mdDialog
      .show({
        template: editTemplate,
        locals: {
          attribute: Object.assign({}, attribute),
          showAllowUnknown: attribute.datType !== 'STRING', // TODO also show if NumericRangeRule is detected
          $mdDialog: this.$mdDialog,
        },
        bindToController: true,
        controller: function Controller() {},
        controllerAs: '$ctrl',
        targetEvent: $event,
        autoWrap: false,
      })
      .then(a => {
        Object.assign(attribute, a);
        this.handleChange();
      })
      .catch(() => {});
  }

  handleChange() {
    this.onChange({ attributes: this.selected });
  }
}

export default {
  template,
  controller: ProjectConfigAttributesController,
  bindings: {
    selected: '<',
    available: '<',
    required: '<',
    onChange: '&',
  },
};
