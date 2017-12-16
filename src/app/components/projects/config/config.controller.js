import angular from 'angular';

export default class ConfigController {
  constructor($scope, $state, project, ProjectConfigService, alerts, config) {
    'ngInject'
    this.$scope = $scope;
    this.$state = $state;
    this.project = project;
    this.ProjectConfigService = ProjectConfigService;
    this.alerts = alerts;

    this.addText = undefined;
    this.config = config;

    $scope.$watch(() => $state.current.name, () => (name) => {
      if (name === 'project.config.entities') {
        this.addText = 'Entity';
      } else if (name === 'project.config.lists') {
        this.addText = 'List';
      }
    });

    $scope.$watch('vm.config', (newVal, oldVal) => {
      if (!this.config.modified && !angular.equals(newVal, oldVal)) {
        this.config.modified = true;
      }
    }, true);
  }

  add() {
    this.$scope.$broadcast('$configAddEvent');
  }

  save() {
    this.alerts.removeTmp();
    this.ProjectConfigService.save(this.config, project.projectId)
      .then((config) => {
        this.project.config = config;
        this.alerts.success("Successfully updated project configuration!");
      }).catch((response) => {
      if (response.status === 400) {
        response.data.errors.forEach(error => this.alerts.error(error));
      }
    });
  }

}
