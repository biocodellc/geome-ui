export default class ProjectMembersService {
  constructor($http, ProjectService, REST_ROOT) {
    'ngInject';

    this.$http = $http;
    this.ProjectService = ProjectService;
    this.REST_ROOT = REST_ROOT;
  }

  all() {
    return this.ProjectService.resolveProjectId().then(projectId =>
      this.$http
        .get(`${this.REST_ROOT}projects/${projectId}/members`)
        .catch(angular.catcher('Failed to load project members')),
    );
  }

  add(username) {
    return this.ProjectService.resolveProjectId().then(projectId =>
      this.$http
        .put(`${this.REST_ROOT}projects/${projectId}/members/${username}`)
        .catch(angular.catcher('Failed to add member to project.')),
    );
  }

  remove(username) {
    return this.ProjectService.resolveProjectId().then(projectId =>
      this.$http
        .delete(`${this.REST_ROOT}projects/${projectId}/members/${username}`)
        .catch(angular.catcher('Failed to remove member from project.')),
    );
  }
}
