import projects from '../projects';

import HeaderController from './header.controller';

let header = () => ({
  template: require('./header.html'),
  controller: HeaderController,
  controllerAs: 'header',
});

export default angular.module('fims.header', [ projects ])
  .directive('fimsHeader', header)
  .name;
