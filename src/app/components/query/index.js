import angular from 'angular';
// sly doesn't export anything. we import here so webpack will bundle/load the file
// then we use the angular module loader to list as a dependency
import '../../../vendor/scalyr';

import modals from '../modals';
import typeahead from './typeahead.directive';
import routing from './query.routes'

export default angular.module('fims.query', [ modals, 'sly', typeahead ])
  .run(routing) // need to declare in run block. otherwise $transitions is not available
  .name;
