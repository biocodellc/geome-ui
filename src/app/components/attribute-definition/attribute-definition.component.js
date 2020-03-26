const template = require('./attribute-definition.html');

class AttributeDefController {
  $onInit() {
    this._config = this.currentProject.config;
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
    rules: '<',
  },
};
