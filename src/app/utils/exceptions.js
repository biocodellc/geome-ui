import angular from 'angular';

export default defaultMsg => response => {
  console.error(response);
  angular.toaster.error(
    response.status !== 404 && response.data
      ? response.data.error || response.data.usrMessage || response.data.message
      : defaultMsg,
  );
  return Promise.reject(response);
};
