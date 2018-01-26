import angular from 'angular';

class EditAttributeController {
  $onInit() {
    this.attribute = Object.assign({}, this.attribute);
    this.datatypes = ['STRING', 'INTEGER', 'FLOAT', 'DATE', 'DATETIME', 'TIME'];
    this.dataformatTypes = ['DATE', 'DATETIME', 'TIME'];
    this.delimited = !!this.attribute.delimiter;
  }

  $onDestroy() {
    this.onUpdate({ attribute: this.attribute });
  }

  toggleDelimited() {
    if (!this.delimited) {
      this.attribute.delimiter = undefined;
    }
  }
}

const fimsAttributeEdit = {
  template: require('./edit-attribute.html'),
  controller: EditAttributeController,
  bindings: {
    attribute: '<',
    onUpdate: '&',
    onClose: '&',
  },
};

export default angular
  .module('fims.projectConfigAttribute', [])
  .component('fimsEditAttribute', fimsAttributeEdit).name;
