import angular from 'angular';
import select from 'ui-select';
import 'ui-select/dist/select.min.css';
import sanitize from 'angular-sanitize';
import modal from 'angular-ui-bootstrap/src/modal';

// dndLists doesn't export anything. we import here so webpack will bundle/load the file
// then we use the angular module loader to list as a dependency
import 'angular-drag-and-drop-lists';
import router from '../../utils/router';
import exceptions from '../../components/exceptions';

import routing from "./project.routes";
import requiresProject from './projectRequired.hook';
import projectAdmin from './projectAdmin.hook'
import run from "./projects.run";
import config from "./projects.config";
import Projects from "./project.service";
import ProjectFactory from "./projectFactory";

import fimsProject from './project.component';
import fimsProjectSettings from './project-settings';
import fimsProjectExpeditions from './project-expeditions';
import fimsProjectMembers from './members';
import fimsProjectConfig from './config';

export const CACHED_PROJECT_EVENT = '$cachedProjectEvent';

const dependencies = [
  modal,
  router,
  exceptions,
  select,
  sanitize,
  'dndLists',
  fimsProjectSettings,
  fimsProjectExpeditions,
  fimsProjectMembers,
  fimsProjectConfig,
];

export default angular.module('fims.project', dependencies)
  .config(config)
  .run(run)
  .run(routing) // need to declare in run block. otherwise $transitions is not available
  .run(requiresProject)
  .run(projectAdmin)
  .component('fimsProject', fimsProject)
  .service('Projects', Projects)
  .service('ProjectFactory', ProjectFactory)
  .name;
