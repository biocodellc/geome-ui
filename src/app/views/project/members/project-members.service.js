import angular from 'angular';

import config from '../../../utils/config';
const { restRoot } = config;

export default class ProjectMembersService {
  constructor($http, ProjectService) {
    'ngInject';

    this.$http = $http;
    this.ProjectService = ProjectService;
  }

  all() {
    return this.ProjectService.resolveProjectId().then(projectId =>
      this.$http
        .get(`${restRoot}projects/${projectId}/members`)
        .catch(angular.catcher('Failed to load project members')),
    );
  }

  add(username) {
    return this.ProjectService.resolveProjectId().then(projectId =>
      this.$http
        .put(`${restRoot}projects/${projectId}/members/${username}`)
        .catch(angular.catcher('Failed to add member to project.')),
    );
  }

  remove(username) {
    return this.ProjectService.resolveProjectId().then(projectId =>
      this.$http
        .delete(`${restRoot}projects/${projectId}/members/${username}`)
        .catch(angular.catcher('Failed to remove member from project.')),
    );
  }
}
