import angular from 'angular';

export default class ListController {
  constructor($scope, $state, project, config, list, ProjectConfigService, alerts) {
    'ngInject'
    this.$scope = $scope;
    this.alerts = alerts;
    this.ProjectConfigService = ProjectConfigService;
    this.project = project;

    this.list = list;
    this.config = config;

    if ($state.params.addField) {
      this.add();
    }

    /**
     * catch child emit event and rebroadcast to all children. This is the only way to broadcast to sibling elements
     */
    $scope.$on("$closeSiblingEditPopupEvent", function (event) {
      event.stopPropagation();
      $scope.$broadcast("$closeEditPopupEvent");
    });

    $scope.$watch('this.config',
      function (newVal, oldVal) {
        if (!config.modified && !angular.equals(newVal, oldVal)) {
          config.modified = true;
        }
      }, true)
  }

  save() {
    this.alerts.removeTmp();
    this.ProjectConfigService.save(this.config, this.project.projectId)
      .then((config) => {
        this.project.config = config;
        this.alerts.success("Successfully updated project configuration!");
      })
      .catch((response) => {
        if (response.status === 400) {
          response.data.errors.forEach(error => this.alerts.error(error));
        }
      });
  }

  add() {
    this.$scope.$broadcast("$closeEditPopupEvent");
    this.list.fields.push({
      isNew: true,
    });
  }

  deleteField(index) {
    this.list.fields.splice(index, 1);
  }
}
