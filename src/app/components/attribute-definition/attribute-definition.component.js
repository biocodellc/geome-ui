const template = require('./attribute-definition.html');

class AttributeDefController {
  constructor() {
    this._config = undefined;
    this.attribute = undefined;
    this.rules = [];
  }

  $onInit() {
    this._config = this.currentProject.config;
  }

  $onChanges() {
    if (this.attribute && this._config) {
      // && attribute.currentValue !== attribute.previousValue) {
      this.rules = this._config.attributeRules(this.sheetName, this.attribute);
    }
  }

  getListFields(listName) {
    const list = this._config.getList(listName);
    return list ? list.fields : [];
  }
}

export default {
  template,
  controller: AttributeDefController,
  bindings: {
    attribute: '<',
    sheetName: '<',
    currentProject: '<',
  },
};
