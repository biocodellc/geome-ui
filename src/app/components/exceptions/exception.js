export default class exception {
  constructor(alerts) {
    'ngInject'

    this.alerts = alerts;
  }

  catcher(defaultMsg) {
    return (response) => {
      this.alerts.error(response.data.error || response.data.usrMessage || defaultMsg);
      return Promise.reject(response);
    }
  }
}
