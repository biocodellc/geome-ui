import angular from 'angular';

import alerts from '../alerts';
import exception from './exception';

export default angular.module('fims.exceptions', [alerts])
  .service('exception', exception)
  .name;
