import angular from 'angular';

import ProjectConfig from '../../../models/ProjectConfig';
import config from '../../../utils/config';

const { restRoot } = config;

export default class ProjectConfigService {
  constructor($http) {
    'ngInject';

    this.$http = $http;
  }

  get(projectId) {
    return this.$http
      .get(`${restRoot}projects/${projectId}/config`)
      .then(({ data }) => new ProjectConfig(data));
  }

  save(projectConfig, projectId) {
    return this.$http({
      method: 'PUT',
      url: `${restRoot}projects/${projectId}/config`,
      data: projectConfig,
      keepJson: true,
    })
      .then(({ data }) => new ProjectConfig(data))
      .catch(response => {
        if (response.status !== 400 || !response.data.errors) {
          angular.catcher('Error updating config')(response);
        }
        throw response;
      });
  }
}
