import angular from 'angular';
import bootstrap from 'angular-ui-bootstrap';

import users from '../../components/users/index';
import modals from '../../components/modals/index';

import routing from './expeditions.routes';
import projectService from '../../services/project.service';
import fimsExpeditionsList from './expeditions-list.component';
import fimsExpedition from '../../components/expeditions/expedition.component';
import fimsExpeditionSettings from '../../components/expeditions/expedition-settings.component';
import fimsExpeditionResources from '../../components/expeditions/expedition-resources.component';


const dependencies = [
  bootstrap,
  modals,
  users,
  projectService,
  fimsExpeditionsList,
  fimsExpedition,
  fimsExpeditionSettings,
  fimsExpeditionResources,
];

export default angular.module('fims.expeditions', dependencies)
  .run(routing)
  .name;
