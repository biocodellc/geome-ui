import angular from 'angular';
import config from '../utils/config';

const { restRoot } = config;

class RecordService {
  constructor($http) {
    'ngInject';

    this.$http = $http;
  }

  get(identifier, httpOpts) {
    return this.$http({
      ...httpOpts,
      method: 'GET',
      url: `${restRoot}records/${identifier}?includeParent&includeChildren`,
    });
  }

  delete(identifier) {
    return this.$http({
      method: 'DELETE',
      url: `${restRoot}records/${identifier}`,
    });
  }
}

export default angular
  .module('fims.recordService', [])
  .service('RecordService', RecordService).name;
