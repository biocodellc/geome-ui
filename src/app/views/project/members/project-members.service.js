import angular from 'angular';
import config from '../../../utils/config';

const { restRoot } = config;

export default class ProjectMembersService {
  constructor($http, ProjectService) {
    'ngInject';

    this.$http = $http;
    this.ProjectService = ProjectService;
  }

  all(projectId) {
    return this.$http
      .get(`${restRoot}projects/${projectId}/members`)
      .catch(angular.catcher('Failed to load project members'));
  }

  add(projectId, username) {
    return this.$http
      .put(`${restRoot}projects/${projectId}/members/${username}`)
      .catch(angular.catcher('Failed to add member to project.'));
  }

  remove(projectId, username) {
    return this.$http
      .delete(`${restRoot}projects/${projectId}/members/${username}`)
      .catch(angular.catcher('Failed to remove member from project.'));
  }
}
