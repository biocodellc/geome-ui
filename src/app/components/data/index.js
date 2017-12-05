import angular from 'angular';

import exceptions from '../exceptions';
import projects from '../projects';
import files from '../files';

export default angular.module('fims.data', [ files, exceptions, projects ])
  .service('DataService', DataService)
  .name;
