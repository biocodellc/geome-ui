import angular from 'angular';
// import 'ng-image-gallery/dist/ng-image-gallery.min';
import 'ng-image-gallery/dist/ng-image-gallery';
import 'ng-image-gallery/dist/ng-image-gallery.min.css';

import recordService from '../../services/record.service';

import routing from './record.routes';
import record from './record.component';

export default angular
  .module('fims.record', [recordService, 'thatisuday.ng-image-gallery'])
  .run(routing)
  .component('fimsRecord', record).name;
