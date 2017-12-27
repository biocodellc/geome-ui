import angular from 'angular';


class EditFieldController {
  $onInit() {
    this.field = Object.assign({}, this.field);
    this.duplicateValue = false;
  }

  $onDestroy() {
    if (!this.duplicateValue) {
      this.onUpdate({ field: this.field });
    }
  }

  validateValue() {
    const val = (this.caseInsensitive) ? this.field.value.toLowerCase() : this.field.value;

    const duplicates = this.fields.map(f => (this.caseInsensitive) ? f.value.toLowerCase() : f.value)
      .filter(v => v === val);


    this.duplicateValue = duplicates.length > 0;
  }
}


const fimsFieldEdit = {
  template: require('./edit-field.html'),
  controller: EditFieldController,
  bindings: {
    field: '<',
    fields: '<',
    onUpdate: '&',
    onClose: '&',
  },
};


export default angular.module('fims.projectConfigField', [])
  .component('fimsEditField', fimsFieldEdit)
  .name;
