class exception {
  constructor($q, alerts) {
    this.q = $q;
    this.alerts = alerts;
  }

  catcher(defaultMsg) {
    return function (response) {
      this.alerts.error(response.data.error || response.data.usrMessage || defaultMsg);
      return this.q.reject(response);
    }
  }
}

exception.$inject = [ '$q', 'alerts' ];
export default exception;
