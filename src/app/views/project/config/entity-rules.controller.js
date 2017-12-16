export default class EntityRulesController {
  constructor($scope, $state, entity, config) {
    'ngInject'
    this.entity = entity;
    this.config = config;


    /**
     * catch child emit event and rebroadcast to all children. This is the only way to broadcast to sibling elements
     */
    $scope.$on("$closeSiblingEditPopupEvent", function (event) {
      event.stopPropagation();
      $scope.$broadcast("$closeEditPopupEvent");
    });

    $scope.$on('$entityAddEvent', () => $state.go(".add"));
  }

  deleteRule(i) {
    this.entity.rules.splice(i, 1);
  }
}
