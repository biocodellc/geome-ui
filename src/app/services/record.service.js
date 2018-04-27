import angular from 'angular';
import config from '../utils/config';

const { restRoot } = config;

class RecordService {
  constructor($http) {
    'ngInject';

    this.$http = $http;
  }

  get(identifier) {
    return this.$http({
      method: 'GET',
      url: `${restRoot}records/${identifier}`,
    });
  }
}

export default angular
  .module('fims.recordService', [])
  .service('RecordService', RecordService).name;
