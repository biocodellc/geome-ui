const trustedHtml = $sce => {
  'ngInject';

  return function(text) {
    return $sce.trustAsHtml(text);
  };
};

export default angular
  .module('fims.filters.html', [])
  .filter('trusted_html', trustedHtml).name;
