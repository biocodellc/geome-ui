import angular from 'angular';

import FileService from './FileService';

export default angular.module('fims.files', [])
  .service('FileService', FileService)
  .name;
