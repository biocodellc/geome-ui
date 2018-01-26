import angular from 'angular';

class EditPropController {
  $onInit() {
    this.prop = Object.assign({}, this.prop);
    delete this.prop.isNew;
    this.duplicateName = false;
  }

  $onDestroy() {
    if (!this.duplicateName) {
      this.onUpdate({ prop: this.prop });
    }
  }

  validateName() {
    const duplicates = this.properties.filter(p => p.name === this.prop.name);
    this.duplicateName = duplicates.length > 0;
  }
}

const fimsEditProp = {
  template: require('./edit-prop.html'),
  controller: EditPropController,
  bindings: {
    prop: '<',
    properties: '<',
    onUpdate: '&',
    onClose: '&',
  },
};

export default angular
  .module('fims.projectConfigEditProp', [])
  .component('fimsEditProp', fimsEditProp).name;
