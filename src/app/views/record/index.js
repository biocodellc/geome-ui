import angular from 'angular';

import recordService from '../../services/record.service';

import routing from './record.routes';
import record from './record.component';

export default angular
  .module('fims.record', [recordService])
  .run(routing)
  .component('fimsRecord', record).name;
