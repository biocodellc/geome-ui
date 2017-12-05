import projects from '../projects';

import HeaderController from './HeaderController';

let header = () => {
  return {
    template: require('./header.html'),
    controller: 'HeaderController as header',
  }
};

export default angular.module('fims.header', [ projects ])
  .directive('fimsHeader', header)
  .controller('HeaderController', HeaderController)
  .name;
