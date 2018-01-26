import angular from 'angular';

export default class {
  catcher(defaultMsg) {
    return response => {
      console.error(response);
      angular.alerts.error(
        response.data.error || response.data.usrMessage || defaultMsg,
      );
      return Promise.reject(response);
    };
  }
}
