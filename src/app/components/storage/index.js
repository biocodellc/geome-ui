import angular from 'angular';

import StorageService from './StorageService';

export default angular.module('fims.storage', [])
  .service('StorageService', StorageService)
  .name;
