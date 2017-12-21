import angular from 'angular';
import bootstrap from 'angular-ui-bootstrap';

import users from '../users';
import projects from '../../views/project';
import modals from '../modals';
import data from '../data';

import ExpeditionService from "./expeditions.service";
import fimsExpeditionsList from './expeditions-list.component';
import fimsExpedition from './expedition.component';
import fimsExpeditionSettings from './expedition-settings.component';
import fimsExpeditionResources from './expedition-resources.component';


const dependencies = [
  bootstrap,
  projects,
  modals,
  users,
  data,
  fimsExpeditionsList,
  fimsExpedition,
  fimsExpeditionSettings,
  fimsExpeditionResources,
];

export default angular.module('fims.expeditions', dependencies)
  .service('ExpeditionService', ExpeditionService)
  .name;
