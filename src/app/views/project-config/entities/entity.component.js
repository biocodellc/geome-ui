import angular from 'angular';

class EditEntityController {
  $onInit() {
    this.entity = Object.assign({}, this.entity);
    this.columns = this.entity.attributes.map(a => a.column);
  }

  $onDestroy() {
    this.onUpdate({ entity: this.entity });
  }
}

const fimsEntityEdit = {
  template: require('./edit-entity.html'),
  controller: EditEntityController,
  bindings: {
    entity: '<',
    onUpdate: '&',
    onClose: '&',
  },
};

class EntityController {
  handleOnUpdate(entity) {
    if (!angular.equals(this.entity, entity)) {
      this.onUpdate({ entity });
    }
  }
}

const fimsEntity = {
  template: require('./entity.html'),
  controller: EntityController,
  bindings: {
    entity: '<',
    editing: '<',
    worksheets: '<',
    onToggleEdit: '&',
    onUpdate: '&',
    onNewWorksheet: '&',
  },
};

export default angular
  .module('fims.projectConfigEntity', [])
  .component('fimsEntity', fimsEntity)
  .component('fimsEditEntity', fimsEntityEdit).name;
