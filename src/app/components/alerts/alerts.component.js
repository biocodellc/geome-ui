import angular from 'angular';

class AlertController {
  getAlerts() {
    return angular.alerts.getAlerts();
  }

  remove(alert) {
    angular.alerts.remove(alert);
  }
}

export default {
  template: require('./alerts.html'),
  controller: AlertController,
};
