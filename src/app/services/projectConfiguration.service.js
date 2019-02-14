import angular from 'angular';

import ProjectConfig from '../models/ProjectConfig';
import config from '../utils/config';

const { restRoot } = config;

class ProjectConfigurationService {
  constructor($http) {
    'ngInject';

    this.$http = $http;
  }

  all(networkApproved = false, includeUser = false) {
    return this.$http
      .get(
        `${restRoot}projects/configs${
          networkApproved ? '?networkApproved=true&' : '?'
        }${includeUser ? 'user=true' : ''}`,
      )
      .then(({ data }) =>
        data.map(d =>
          d.config
            ? Object.assign({}, d, { config: new ProjectConfig(d.config) })
            : d,
        ),
      );
  }

  get(id) {
    return this.$http
      .get(`${restRoot}projects/configs/${id}`)
      .then(({ data }) =>
        Object.assign({}, data, { config: new ProjectConfig(data.config) }),
      );
  }

  save(projectConfiguration) {
    return this.$http({
      method: 'PUT',
      url: `${restRoot}projects/configs/${projectConfiguration.id}`,
      data: projectConfiguration,
      keepJson: true,
    }).then(({ data }) =>
      Object.assign({}, data, { config: new ProjectConfig(data.config) }),
    );
  }
}

export default angular
  .module('fims.projectConfigurationService', [])
  .service('ProjectConfigurationService', ProjectConfigurationService).name;
