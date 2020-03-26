const template = require('./attribute-definition.html');

class AttributeDefController {
  $onChanges() {
    this._config = this.currentProject.config;
    if (this.attribute) {
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
    //    rules: '<',
  },
};
