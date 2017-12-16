// angular.module('fims.projects')
//     .factory('ProjectMembersService', ProjectMembersService);

// ProjectMembersService.$inject = ['$http', 'ProjectService', 'exception', 'REST_ROOT'];

export default class ProjectMembersService {
  constructor($http, ProjectService, exception, REST_ROOT) {
    "ngInject";

    this.$http = $http;
    this.ProjectService = ProjectService;
    this.exception = exception;
    this.REST_ROOT = REST_ROOT;
  }

  all() {
    return this.ProjectService.resolveProjectId()
      .then((projectId) =>
        this.$http.get(this.REST_ROOT + 'projects/' + projectId + '/members')
          .catch(this.exception.catcher("Failed to load project members")),
      );
  }

  add(username) {
    return this.ProjectService.resolveProjectId()
      .then((projectId) => this.$http.put(this.REST_ROOT + 'projects/' + projectId + '/members/' + username)
        .catch(this.exception.catcher("Failed to add member to project.")),
      );
  }

  remove(username) {
    return this.ProjectService.resolveProjectId()
      .then((projectId) => this.$http.delete(this.REST_ROOT + 'projects/' + projectId + '/members/' + username)
        .catch(this.exception.catcher("Failed to remove member from project.")),
      );
  }
}
