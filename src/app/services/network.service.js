import angular from 'angular';

import config from '../utils/config';

const { restRoot } = config;

class NetworkService {
  constructor($http) {
    'ngInject';

    this.$http = $http;
  }

  get() {
    return this.$http.get(`${restRoot}network`).then(({ data }) => data);
  }
}

export default angular
  .module('fims.networkService', [])
  .service('NetworkService', NetworkService).name;
