const template = require('./project-config-attributes.html');
const editTemplate = require('./edit-attribute.html');

class ProjectConfigAttributesController {
  constructor($filter, $mdDialog) {
    'ngInject';

    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.requiredUris = [];
    this.selectedAttributeMap = {};

    this.onSelect = this.onSelect.bind(this);
    this.onDeSelect = this.onDeSelect.bind(this);
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
      this.selectedAttributeMap = this.selectedAttributes.reduce((map, a) => {
        map[a.uri] = Object.assign({}, a);
        return map;
      }, {});

      // make a copy of the available attributes, overriding any custom properties
      // that our selectAttributes have set
      // available is typically all network attributes, selected is the project attributes.
      // There are a few properties that can be overriden by the project, such as group & description.
      // In either md-data-table or dnd-lists the selectedAttribute is set to the available attribute props,
      // thus not displaying any custom set attribute properties and instead displaying the network default.
      // This is a bit of a hack but it works
      this.available = this.available.reduce(
        (accumulator, attribute) =>
          accumulator.concat(
            Object.assign(
              {},
              attribute,
              this.selectedAttributeMap[attribute.uri],
            ),
          ),
        [],
      );
    } else if ('available' in changesObj) {
      this.available = this.available.reduce(
        (accumulator, attribute) =>
          accumulator.concat(
            Object.assign(
              {},
              attribute,
              this.selectedAttributeMap[attribute.uri],
            ),
          ),
        [],
      );
    }
  }

  onSelect(attribute) {
    this.selectedAttributeMap[attribute.uri] = attribute;
    this.handleChange();
  }

  onDeSelect(attribute) {
    this.selectedAttributeMap[attribute.uri] = undefined;
    this.handleChange();
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
          showAllowUnknown: attribute.dataType !== 'STRING', // TODO also show if NumericRangeRule is detected
          $mdDialog: this.$mdDialog,
        },
        bindToController: true,
        controller: function Controller() {},
        controllerAs: '$ctrl',
        targetEvent: $event,
        autoWrap: false,
      })
      .then(a => {
        // if we don't explicitly set a group, then the network group will be used.
        // if !group then we assume the user wants the 'Default Group'
        const i = this.selectedAttributes.findIndex(attr => attr.uri === a.uri);
        this.selectedAttributes.splice(i, 1, {
          ...a,
          group: a.group || 'Default Group',
        });
        this.handleChange();
      })
      .catch(() => {});
  }

  canEditAttribute(attribute) {
    // only allow editing selected atributes
    return this.selectedAttributeMap[attribute.uri];
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
