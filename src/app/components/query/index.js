import angular from 'angular';
// sly doesn't export anything. we import here so webpack will bundle/load the file
// then we use the angular module loader to list as a dependency
import '../../../vendor/scalyr';

import modals from '../modals';
import typeahead from './typeahead.directive';
import routing from './query.routes'
import files from '../../services/files.service';
import projectsService from '../../services/projects.service';

export default angular.module('fims.query', [ modals, 'sly', typeahead, files, projectsService ])
  .run(routing) // need to declare in run block. otherwise $transitions is not available
  .name;
