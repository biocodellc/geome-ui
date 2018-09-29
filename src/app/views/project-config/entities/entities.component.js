const template = require('./entities.html');

class EntitiesController {
  constructor($uibModal) {
    'ngInject';

    this.$uibModal = $uibModal;
  }

  $onChanges(changesObj) {
    if (this.config && 'config' in changesObj) {
      this.entities = this.config.entities.slice(); // make a copy of the array
    }
  }

  handleToggleEdit(index) {
    if (this.editEntity === index) {
      delete this.editEntity;
    } else {
      this.editEntity = index;
    }
  }

  handleUpdateEntity($index, entity) {
    const oldEntity = this.entities[$index];

    const { uniqueKey } = entity;
    if (oldEntity.uniqueKey !== uniqueKey) {
      const rule = this.config.getRule(
        entity.conceptAlias,
        'RequiredValue',
        'ERROR',
      );

      if (rule.columns.includes(uniqueKey)) {
        rule.columns.push(uniqueKey);
      }
    }

    this.entities.splice($index, 1, entity);
    this.onUpdateEntities({ entities: this.entities });
  }
}

export default {
  template,
  controller: EntitiesController,
  bindings: {
    config: '<',
    onUpdateEntities: '&',
    onNewWorksheet: '&',
  },
};
