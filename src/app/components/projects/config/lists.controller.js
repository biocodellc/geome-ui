export default class ListsController {
  constructor($scope, $state, config) {
    this.config = config;

    /**
     * catch child emit event and rebroadcast to all children. This is the only way to broadcast to sibling elements
     */
    $scope.$on("$closeSiblingEditPopupEvent", function (event) {
      event.stopPropagation();
      $scope.$broadcast("$closeEditPopupEvent");
    });

    $scope.$on('$configAddEvent', () => $state.go('.add'));
  }
}
