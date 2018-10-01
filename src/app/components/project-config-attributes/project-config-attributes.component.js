const template = require('./project-config-attributes.html');
const editTemplate = require('./edit-attribute.html');

class ProjectConfigAttributesController {
  constructor($scope, $filter, $mdDialog) {
    'ngInject';

    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    $scope.$watchCollection('$ctrl.selectedAttributes', (newVal, oldVal) => {
      // call handleChange if an attribute was selected/deselected
      if (newVal && oldVal && newVal.length !== oldVal.length) {
        this.handleChange();
      }
    });
    this.requiredUris = [];
  }

  $onInit() {
    this.orderBy = 'sheetOrder';
    this.showTooltips = true;
  }

  $onChanges(changesObj) {
    if ('requiredAttributes' in changesObj) {
      this.requiredUris = this.requiredAttributes
        ? this.requiredAttributes.map(a => a.uri)
        : [];
    }
    if ('selectedAttributes' in changesObj) {
      this.orderedAttributes = this.selectedAttributes.map(a => a.uri);
    }
  }

  orderedIndex(attribute) {
    const i = this.orderedAttributes.indexOf(attribute.uri);
    return i === -1 ? 'N/A' : i;
  }

  enableTooltips() {
    this.showTooltips = true;
  }

  disableTooltips() {
    this.showTooltips = false;
  }

  dndDrop(index, item) {
    if (!this.orderBy && this.orderBy.contains('sheetOrder')) return false;
    // const currentIndex = this.selectedAttributes.indexOf(item);
    const currentIndex = this.selectedAttributes.findIndex(
      a => a.uri === item.uri,
    );

    // drag to the same place
    if (index === currentIndex || index === currentIndex + 1) {
      return false;
    }

    // remove the item from the current position
    this.selectedAttributes.splice(currentIndex, 1);

    // 'fix' the new position index if it was shifted after the removing
    if (currentIndex < index) {
      index--;
    }

    // insert the item into the new position
    this.selectedAttributes.splice(index, 0, item);
    this.handleChange();
    return true;
  }

  getAvailable() {
    const isDesc = this.orderBy.startsWith('-');
    if (this.orderBy === 'required' || this.orderBy === '-required') {
      return this.available.slice().sort((a, b) => {
        if (this.requiredUris.includes(a.uri)) {
          if (this.requiredUris.includes(b.uri)) return 0;
          return isDesc ? 1 : -1;
        } else if (this.requiredUris.includes(b.uri)) return isDesc ? -1 : 1;
        return 0;
      });
    } else if (
      this.orderBy === 'sheetOrder' ||
      this.orderBy === '-sheetOrder'
    ) {
      return this.available.slice().sort((a, b) => {
        const orderA = this.orderedAttributes.indexOf(a.uri);
        const orderB = this.orderedAttributes.indexOf(b.uri);

        // -1 at end
        if (orderA === -1) return 1;
        if (orderA === orderB) return 0;
        if (orderB === -1) return -1;
        if (orderA > orderB) return isDesc ? -1 : 1;
        return isDesc ? 1 : -1;
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
    this.onChange({ attributes: this.selectedAttributes });
  }
}

export default {
  template,
  controller: ProjectConfigAttributesController,
  bindings: {
    selectedAttributes: '<',
    available: '<',
    requiredAttributes: '<',
    onChange: '&',
  },
};
