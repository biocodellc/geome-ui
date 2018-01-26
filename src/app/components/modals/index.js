import angular from 'angular';
import bootstrap from 'angular-ui-bootstrap';

import angularSpinner from '../../directives/angular-spinner.directive';
import LoadingModalService from './LoadingModalService';
import FailModalService from './FailModalService';

export default angular
  .module('fims.modals', [bootstrap, angularSpinner])
  .service('LoadingModal', LoadingModalService)
  .service('FailModalFactory', FailModalService).name; // TODO rename to FailModalService
