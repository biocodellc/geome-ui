import angular from 'angular';

import ProjectConfig from '../models/ProjectConfig';
import config from '../utils/config';

const { restRoot } = config;

class NetworkConfigurationService {
  constructor($http) {
    'ngInject';

    this.$http = $http;
  }

  get() {
    return this.$http
      .get(`${restRoot}network/config`)
      .then(({ data }) => new ProjectConfig(data));
  }
}

export default angular
  .module('fims.networkConfigurationService', [])
  .service('NetworkConfigurationService', NetworkConfigurationService).name;
