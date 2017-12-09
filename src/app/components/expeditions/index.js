import angular from 'angular';
import bootstrap from 'angular-ui-bootstrap';

import users from '../users';
import projects from '../projects';
import modals from '../modals';
import data from '../data';

import ExpeditionService from "./expeditions.service";


export default angular.module('fims.expeditions', [ bootstrap, projects, modals, users, data ])
  .service('ExpeditionService', ExpeditionService)
  .name;
