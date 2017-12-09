import angular from 'angular';

import dndLists from 'angular-drag-and-drop-lists';
import router from '../router';
import exceptions from '../exceptions';
import select from 'ui-select';

import routing from "./project.routes";
import run from "projects.run";
import config from "projects.config";
import ProjectController from "./project.controller";
import ProjectService from "./project.service";
import ProjectExpeditionsController from "./project-expeditions.controller";
import ProjectSettingsController from "./project-settings.controller";
import ProjectFactory from "./projectFactory";
import ProjectMembersService from "./members/project-members.service";
import ProjectConfigService from "./config/ProjectConfigService";


//TODO finish the config dir refactor
export default angular.module('fims.projects', [ router, exceptions, select, dndLists ])
  .run(run)
  .config(config)
  .config(routing)
  .controller('ProjectController', ProjectController)
  .controller('ProjectExpeditionsController', ProjectExpeditionsController)
  .controller('ProjectSettingsController', ProjectSettingsController)
  .service('ProjectService', ProjectService)
  .service('ProjectFactory', ProjectFactory)
  .service('ProjectMembersService', ProjectMembersService)
  .service('ProjectConfigService', ProjectConfigService)
  .name;
