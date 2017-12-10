import angular from 'angular';
import select from 'ui-select';
import modal from 'angular-ui-bootstrap/src/modal';

// dndLists doesn't export anythin. we import here so webpack will bundle/load the file
// then we use the angular module loader to list as a dependency
import 'angular-drag-and-drop-lists';
import router from '../../utils/router';
import exceptions from '../exceptions';

import routing from "./project.routes";
import run from "./projects.run";
import config from "./projects.config";
import ProjectController from "./project.controller";
import ProjectService from "./project.service";
import ProjectExpeditionsController from "./project-expeditions.controller";
import ProjectSettingsController from "./project-settings.controller";
import ProjectFactory from "./projectFactory";
import ProjectMembersService from "./members/project-members.service";
import ProjectConfigService from "./config/ProjectConfigService";


//TODO finish the config dir refactor
export default angular.module('fims.projects', [ modal, router, exceptions, select, 'dndLists' ])
  .config(config)
  .run(run)
  .run(routing) // need to declare in run block. otherwise $transitions is not available
  .controller('ProjectController', ProjectController)
  .controller('ProjectExpeditionsController', ProjectExpeditionsController)
  .controller('ProjectSettingsController', ProjectSettingsController)
  .service('ProjectService', ProjectService)
  .service('ProjectFactory', ProjectFactory)
  .service('ProjectMembersService', ProjectMembersService)
  .service('ProjectConfigService', ProjectConfigService)
  .name;
