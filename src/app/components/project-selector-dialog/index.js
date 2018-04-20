import angular from 'angular';

import projectSelector from '../project-selector';
import projectSelectorDialog from './projectSelectorDialog.component';

export default angular
  .module('fims.projectSelectorDialog', [projectSelector])
  .component('projectSelectorDialog', projectSelectorDialog).name;
