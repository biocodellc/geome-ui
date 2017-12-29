import angular from 'angular';

import exceptions from '../exceptions';
import files from '../files';
import DataService from "./data.service";

export default angular.module('fims.data', [ files, exceptions ])
  .service('DataService', DataService)
  .name;
