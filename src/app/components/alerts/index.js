import angular from 'angular';

import Alerts from './alerts.service';
import AlertController from "./alerts.controller";

const alerts = () => ({
  template: require('./alerts.html'),
  controller: AlertController,
  controllerAs: 'alerts',
});

export default angular.module('fims.alerts', [])
  .directive('alerts', alerts)
  .service('alerts', Alerts)
  .name;
