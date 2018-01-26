import angular from 'angular';

import projectSelector from '../project-selector';
import header from './header.component';

export default angular
  .module('fims.header', [projectSelector])
  .component('fimsHeader', header).name;
