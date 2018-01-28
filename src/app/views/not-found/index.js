import angular from 'angular';

import routing from './not-found.routes';
import notFound from './not-found.component';

export default angular
  .module('fims.notFound', [])
  .run(routing)
  .component('notFound', notFound).name;
