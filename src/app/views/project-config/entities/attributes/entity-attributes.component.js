import angular from 'angular';

const template = require('./entity-attributes.html');

class EntityAttributesController {
  constructor($anchorScroll, ConfirmationService) {
    'ngInject';

    this.$anchorScroll = $anchorScroll;
    this.ConfirmationService = ConfirmationService;
  }

  $onInit() {
    this.editAttribute = undefined;
  }

  $onChanges(changesObj) {
    if (this.attributes && 'attributes' in changesObj) {
      this.attributes = this.attributes.slice();

      const newAttributeIndex = this.attributes.findIndex(a => a.isNew);
      if (newAttributeIndex > -1) {
        this.editAttribute = newAttributeIndex;
        this.$anchorScroll(`attribute_${newAttributeIndex}`);
        delete this.attributes[newAttributeIndex].isNew;
      }
    }
  }

  dndDrop(index, item) {
    const currentIndex = this.attributes.findIndex(a =>
      angular.equals(a, item),
    );

    // drag to the same place
    if (index === currentIndex || index === currentIndex + 1) {
      return false;
    }

    // remove the item from the current position
    this.attributes.splice(currentIndex, 1);

    // 'fix' the new position index if it was shifted after the removing
    if (currentIndex < index) {
      index--;
    }

    // insert the item into the new position
    this.attributes.splice(index, 0, item);
    this.onUpdateAttributes({ attributes: this.attributes });
    return true;
  }

  dndStart() {
    delete this.editAttribute;
  }

  handleToggleEdit(index) {
    if (this.editAttribute === index) {
      delete this.editAttribute;
    } else {
      this.editAttribute = index;
    }
  }

  handleOnDelete(index) {
    this.ConfirmationService.confirm(
      `Are you sure you want to delete this attribute?
        <strong>Any data for this attribute will no longer be accessible</strong>.`,
      () => {
        this.attributes.splice(index, 1);
        this.onUpdateAttributes({ attributes: this.attributes });
      },
    );
  }

  handleOnUpdate(index, attribute) {
    this.attributes.splice(index, 1, attribute);
    this.onUpdateAttributes({ attributes: this.attributes });
  }
}

const fimsEntityAttributes = {
  template,
  controller: EntityAttributesController,
  bindings: {
    attributes: '<',
    currentProject: '<',
    onUpdateAttributes: '&',
  },
};

export default angular
  .module('fims.projectConfigEntityAttributes', [])
  .component('fimsEntityAttributes', fimsEntityAttributes).name;
