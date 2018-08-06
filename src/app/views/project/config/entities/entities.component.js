const template = require('./entities.html');

class EntitiesController {
  constructor($uibModal, $anchorScroll, ConfirmationService) {
    'ngInject';

    this.$uibModal = $uibModal;
    this.$anchorScroll = $anchorScroll;
    this.ConfirmationService = ConfirmationService;
  }

  $onChanges(changesObj) {
    if (this.config && 'config' in changesObj) {
      this.entities = this.config.entities.slice(); // make a copy of the array

      const newEntityIndex = this.entities.findIndex(e => e.isNew);
      if (newEntityIndex > -1) {
        this.editEntity = newEntityIndex;
        this.$anchorScroll(`entity_${newEntityIndex}`);
        delete this.entities[newEntityIndex].isNew;
      }
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
    this.ConfirmationService.confirm(
      `Are you sure you want to delete this entity?
        <strong>It is strongly recommended that you export your data first. All data associated with this attribute will
            be lost.</strong>`,
      () => {
        const i = this.entities.indexOf(entity);
        this.entities.splice(i, 1);
        this.onUpdateEntities({ entities: this.entities });
      },
    );
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
