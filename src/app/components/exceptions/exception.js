// TODO remove this and user utils/exceptions and the global angular object
export default class exception {
  constructor(alerts) {
    'ngInject'

    this.alerts = alerts;
  }

  catcher(defaultMsg) {
    return (response) => {
      console.log(response);
      this.alerts.error(response.data.error || response.data.usrMessage || defaultMsg);
      return Promise.reject(response);
    }
  }
}