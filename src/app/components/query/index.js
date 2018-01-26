import angular from 'angular';
// sly doesn't export anything. we import here so webpack will bundle/load the file
// then we use the angular module loader to list as a dependency
import '../../../vendor/scalyr';

import modals from '../modals';
import typeahead from './typeahead.directive';
import routing from './query.routes';
import fileService from '../../services/file.service';
import authService from '../../services/auth.service';
import projectService from '../../services/project.service';
import expeditionService from '../../services/expedition.service';

export default angular
  .module('fims.query', [
    modals,
    'sly',
    typeahead,
    fileService,
    projectService,
    authService,
    expeditionService,
  ])
  .run(routing).name; // need to declare in run block. otherwise $transitions is not available
