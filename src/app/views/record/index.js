import angular from 'angular';
import ngImageGallery from '../../directives/ngImageGallery.directive';

import recordService from '../../services/record.service';
import routing from './record.routes';
import record from './record.component';

export default angular
  .module('fims.record', [recordService, ngImageGallery])
  .run(routing)
  .component('fimsRecord', record).name;
