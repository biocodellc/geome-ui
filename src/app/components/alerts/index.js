import angular from 'angular';

import Alerts from './alerts.service';
import alerts from './alerts.component';

export default angular.module('fims.alerts', [])
  .component('alerts', alerts)
  .service('alerts', Alerts)
  .name;
