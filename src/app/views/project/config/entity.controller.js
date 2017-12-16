import angular from 'angular';

export default class EntityController {
  constructor($scope, $state, project, ProjectConfigService, alerts, config) {
    'ngInject'
    this.$scope = $scope;
    this.ProjectConfigService = ProjectConfigService;
    this.alerts = alerts;

    this.addText = undefined;
    this.config = config;

    $scope.$watch(() => $state.current.name, (name) => {
      if (name === 'project.config.entities.detail.attributes') {
        this.addText = 'Attribute';
      } else if (name === 'project.config.entities.detail.rules') {
        this.addText = 'Rule';
      }
    });

    $scope.$watch('vm.config', (newVal, oldVal) => {
      if (!this.config.modified && !angular.equals(newVal, oldVal)) {
        this.config.modified = true;
      }
    }, true);
  }

  add() {
    this.$scope.$broadcast('$entityAddEvent');
  }

  save() {
    this.alerts.removeTmp();
    this.ProjectConfigService.save(this.config, project.projectId)
      .then((config) => {
        project.config = config;
        this.alerts.success("Successfully updated project configuration!");
      })
      .catch((response) => {
        if (response.status === 400) {
          response.data.errors.forEach(error => this.alerts.error(error))
        }
      });
  }
}
