class AlertController {
  constructor(alerts) {
    'ngInject';
    this.alerts = alerts;
  }

  getAlerts() {
    return this.alerts.getAlerts();
  }

  remove(alert) {
    this.alerts.remove(alert);
  }
}

export default {
  template: require('./alerts.html'),
  controller: AlertController,
};