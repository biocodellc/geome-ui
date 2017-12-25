import angular from 'angular';


class EntityAttributesController {
  constructor($location, $anchorScroll) {
    'ngInject';

    this.$location = $location;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this.editAttribute = undefined;

    const newAttributeIndex = this.attributes.findIndex(a => a.isNew);
    if (newAttributeIndex > -1) {
      this.editAttribute = newAttributeIndex;
      this.$location.hash("attribute_" + newAttributeIndex);
      this.$anchorScroll();
      delete this.attributes[ newAttributeIndex ].isNew;
    }
  }

  $onChanges(changesObj) {
    if (changesObj.attributes) {
      this.attributes = this.attributes.slice();
    }
  }

  dndDrop(index, item) {
    const currentIndex = this.attributes.findIndex(a => angular.equals(a, item));

    // drag to the same place
    if (index === currentIndex || index === (currentIndex + 1)) {
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
    this.attributes.splice(index, 1);
    this.onUpdateAttributes({ attributes: this.attributes });
  }

  handleOnUpdate(attribute) {
    console.log('update attribute', attribute);
  }
}

const fimsEntityAttributes = {
  template: require('./entity-attributes.html'),
  controller: EntityAttributesController,
  bindings: {
    attributes: '<',
    currentProject: '<',
    onDeleteAttribute: '&',
    onUpdateAttributes: '&',
  },
};

export default angular.module('fims.projectConfigEntityAttributes', [])
  .component('fimsEntityAttributes', fimsEntityAttributes)
  .name;
