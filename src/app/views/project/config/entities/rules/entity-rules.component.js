import angular from 'angular';


class EntityRulesController {
  constructor($scope, $state) {
    'ngInject';
    /**
     * catch child emit event and rebroadcast to all children. This is the only way to broadcast to sibling elements
     */
    $scope.$on("$closeSiblingEditPopupEvent", function (event) {
      event.stopPropagation();
      $scope.$broadcast("$closeEditPopupEvent");
    });

    $scope.$on('$entityAddEvent', () => $state.go(".add"));
  }

  $onChanges(changesObj) {
    if (changesObj.rules) {
      this.rules = this.rules.slice();
    }
  }

  deleteRule(i) {
    this.rules.splice(i, 1);
  }
}

const fimsEntityRules = {
  template: require('./entity-rules.html'),
  controller: EntityRulesController,
  bindings: {
    config: '<',
    rules: '<',
  },
};

export default angular.module('fims.projectConfigEntityRules', [])
  .component('fimsEntityRules', fimsEntityRules)
  .name;
