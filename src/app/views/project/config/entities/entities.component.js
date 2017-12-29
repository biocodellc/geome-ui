class EntitiesController {
  constructor($uibModal, $location, $anchorScroll, ConfirmationService) {
    'ngInject';

    this.$uibModal = $uibModal;
    this.$location = $location;
    this.$anchorScroll = $anchorScroll;
    this.ConfirmationService = ConfirmationService;
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
    this.ConfirmationService.confirm(
      `Are you sure you want to delete this entity?
        <strong>It is strongly recommended that you export your data first. All data associated with this attribute will
            be lost.</strong>`,
      () => {
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
}

export default {
  template: require('./entities.html'),
  controller: EntitiesController,
  bindings: {
    config: '<',
    onUpdateEntities: '&',
    onNewWorksheet: '&',
  },
};