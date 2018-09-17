import angular from 'angular';

const template = require('./edit-attribute.html');

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
  template,
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
