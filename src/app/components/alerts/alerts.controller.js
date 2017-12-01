export default class AlertController {
  constructor(alerts) {
    this.alerts = alerts;
  }

  getAlerts() {
    return this.alerts.getAlerts();
  }

  remove(alert) {
    this.alerts.remove(alert);
  }
}

AlertController.$inject = [ 'alerts' ];
