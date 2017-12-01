import angular from 'angular';

class Message {
  constructor(msg, level, persist) {
    this.msg = msg;
    this.level = level;
    this.persist = persist || false;
  }
}

export default class Alerts {
  constructor() {
    this.alerts = [];
  }

  info(msg, persist) {
    const m = new Message(msg, 'info', persist);
    return this._addMessage(m);
  }

  success(msg, persist) {
    const m = new Message(msg, 'success', persist);
    return this._addMessage(m);
  }

  warn(msg, persist) {
    const m = new Message(msg, 'warning', persist);
    return this._addMessage(m);
  }

  error(msg, persist) {
    const m = new Message(msg, 'error', persist);
    return this._addMessage(m);
  }

  getAlerts() {
    return this.alerts;//.slice();
  }

  remove(alert) {
    const toRemove = this.alerts.findIndex(a => angular.equals(a, alert));

    if (toRemove !== undefined) {
      this.alerts.splice(toRemove, 1);
    }
  }

  removeTmp() {
    this.alerts.forEach((a, i) => {
      if (!a.persist) {
        this.alerts.splice(i, 1);
      }
    });
  }

  _addMessage(m) {
    const alert = this.alerts.find(a => angular.equals(a, m));

    if (alert) return alert;

    this.alerts.push(m);
  }
}
