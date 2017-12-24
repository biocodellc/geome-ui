import angular from 'angular';


class EditAttributeController {
  $onInit() {
    this.attribute = Object.assign({}, this.attribute);
    this.datatypes = [ 'STRING', 'INTEGER', 'FLOAT', 'DATE', 'DATETIME', 'TIME' ];
    this.dataformatTypes = [ 'DATE', 'DATETIME', 'TIME' ];
    this.delimited = false;
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

class AttributeController {
  $onChanges(changesObj) {
    console.log(changesObj);
  }
  handleOnUpdate(attribute) {
    if (!angular.equals(this.attribute, attribute)) {
      this.onUpdate({ attribute });
    }
  }
}

const fimsAttribute = {
  template: require('./attribute.html'),
  controller: AttributeController,
  bindings: {
    attribute: '<',
    onDelete: '&',
    onToggleEdit: '&',
  },
};


export default angular.module('fims.projectConfigAttribute', [])
  .component('fimsAttribute', fimsAttribute)
  .component('fimsEditAttribute', fimsAttributeEdit)
  .name;
