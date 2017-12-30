import angular from 'angular';

import projectService from '../../services/project.service';
import projectSelector from './projectSelector.component';


export default angular.module('fims.projectSelector', [ projectService ])
  .component('projectSelector', projectSelector)
  .name;
