import angular from 'angular';

const template = require('./add-entity.html');

class AddEntityController {
  $onInit() {
    this.entities = this.entities.map(c => c.conceptAlias);
    this.isChild = false;
    this.conceptAlias = undefined;
    this.conceptURI = undefined;
    this.parentEntity = undefined;
  }

  addEntity() {
    const e = this.entities.find(
      alias => alias.toLowerCase() === this.conceptAlias.toLowerCase(),
    );

    if (e) {
      this.addForm.conceptAlias.$setValidity('unique', false);
      return;
    }

    this.onAddEntity({
      entity: {
        attributes: [],
        rules: [],
        conceptAlias: this.conceptAlias.toLowerCase(),
        parentEntity: this.parentEntity,
        conceptURI: this.conceptURI,
        editable: true,
        // isNew: true,
      },
    });
  }
}

const fimsProjectConfigEntityAdd = {
  template,
  controller: AddEntityController,
  bindings: {
    entities: '<',
    onAddEntity: '&',
  },
};

export default angular
  .module('fims.projectConfigEntityAdd', [])
  .component('fimsProjectConfigEntityAdd', fimsProjectConfigEntityAdd).name;
