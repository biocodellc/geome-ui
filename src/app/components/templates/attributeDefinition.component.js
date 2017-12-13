import AttributeDefController from "./AttributeDefController";

export default {
  template: require('./attribute-definition.html'),
  controller: AttributeDefController,
  controllerAs: "defVm",
  bindings: {
    attribute: "<",
    sheetName: "<",
  },
};