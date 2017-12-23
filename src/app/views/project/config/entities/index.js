import angular from 'angular';

import projectConfigEntity from './entity.component';

function _deleteConfirmationController($uibModalInstance) {
  'ngInject';
  const vm = this;
  vm.delete = $uibModalInstance.close;
  vm.cancel = $uibModalInstance.dismiss;
}

class EntitiesController {
  constructor($uibModal, $location, $anchorScroll) {
    'ngInject';

    this.$uibModal = $uibModal;
    this.$location = $location;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this.entities = this.config.entities.slice(); // make a copy of the array

    const newEntityIndex = this.entities.findIndex(e => e.isNew);
    if (newEntityIndex > -1) {
      this.editEntity = newEntityIndex;
      this.$location.hash("entity_" + newEntityIndex);
      this.$anchorScroll();
      delete this.entities[ newEntityIndex ].isNew;
    }
  }

  handleToggleEdit(index) {
    if (this.editEntity === index) {
      delete this.editEntity;
    } else {
      this.editEntity = index;
    }
  }

  handleRemoveEntity(entity) {
    const modal = this.$uibModal.open({
      template: require('./delete-entity-confirmation.html'),
      size: 'md',
      controller: _deleteConfirmationController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: 'static',
    });

    modal.result.then(() => {
      const i = this.entities.indexOf(entity);
      this.entities.splice(i, 1);
      this.onUpdateEntities({ entities: this.entities });
    });
  }

  handleUpdateEntity($index, entity) {
    const oldEntity = this.entities[ $index ];

    const { uniqueKey } = entity;
    if (oldEntity.uniqueKey !== uniqueKey) {
      const rule = this.config.getRule(entity.conceptAlias, 'RequiredValue', 'ERROR');

      if (rule.columns.includes(uniqueKey)) {
        rule.columns.push(uniqueKey);
      }
    }

    this.entities.splice($index, 1, entity);
    this.onUpdateEntities({ entities: this.entities });
  }

  handleNewWorksheet(sheetName) {
    // TODO does this work?
    this.config.addWorksheet(sheetName);
  }

}


const fimsProjectConfigEntities = {
  template: require('./entities.html'),
  controller: EntitiesController,
  bindings: {
    // entities: '<',
    config: '<',
    onUpdateEntities: '&',
  },
};

export default angular.module('fims.projectConfigEntities', [ projectConfigEntity, ])
  .component('fimsProjectConfigEntities', fimsProjectConfigEntities)
  .name;
