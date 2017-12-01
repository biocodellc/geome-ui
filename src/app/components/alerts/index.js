import angular from 'angular';

import Alerts from './alerts.service';
import AlertController from "./alerts.controller";

const alerts = () => {
  return {
    template: require('./alerts.html'),
    controller: 'AlertController',
    controllerAs: 'alerts'
  }
};

export default angular.module('fims.alerts', [])
  .directive('alerts', alerts)
  .service('alerts', Alerts)
  .controller('AlertController', AlertController)
  .name;
