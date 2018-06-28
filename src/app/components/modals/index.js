
import angular from 'angular';
import bootstrap from 'angular-ui-bootstrap';

import LoadingModalService from './LoadingModalService';

export default angular
  .module('fims.modals', [bootstrap])
  .service('LoadingModal', LoadingModalService).name; 
