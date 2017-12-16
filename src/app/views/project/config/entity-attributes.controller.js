import angular from 'angular';

export default class EntityAttributesController {
  constructor($state, $scope, entity) {
    'ngInject'
    this.$scope = $scope;

    this.attributes = entity.attributes;

    if ($state.params.addAttribute) {
      this._newAttribute();
    }

    /**
     * catch child emit event and rebroadcast to all children. This is the only way to broadcast to sibling elements
     */
    $scope.$on("$closeSiblingEditPopupEvent", function (event) {
      event.stopPropagation();
      $scope.$broadcast("$closeEditPopupEvent");
    });

    $scope.$on('$entityAddEvent', this._newAttribute);

  }

  dndDropCallback(index, item) {
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
    return true;
  }

  dndStartCallback() {
    this.$scope.$broadcast("$closeEditPopupEvent");
  }

  deleteAttr(i) {
    this.attributes.splice(i, 1);
  }

  _newAttribute() {
    this.attributes.push({
      datatype: 'STRING',
      group: 'Default',
      isNew: true,
    });
  }
}
