import angular from 'angular';
import config from '../utils/config';

const { restRoot } = config;

class RecordService {
  constructor($http) {
    'ngInject';

    this.$http = $http;
  }

  get(identifier, httpOpts) {
    const re = new RegExp(/^ark:\/\d{5}\/[A-Za-z]+2$/);
    const path = re.exec(identifier) ? 'bcids/metadata/' : 'records/';

    return this.$http({
      ...httpOpts,
      method: 'GET',
      url: `${restRoot}${path}${identifier}?includeParent&includeChildren`,
      headers: {
        Link:
          '<https://api.geome-db.org/records/ark:/21547/lF2113?includeParent&includeChildren>; rel="alternate"; type="application/json"',
      },
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
