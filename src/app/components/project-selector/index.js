import angular from 'angular';

import projectsService from '../../services/projects.service';
import projectSelector from './projectSelector.component';


export default angular.module('fims.projectSelector', [ projectsService ])
  .component('projectSelector', projectSelector)
  .name;
