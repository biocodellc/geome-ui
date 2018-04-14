import angular from 'angular';
import bootstrap from 'angular-ui-bootstrap';

import angularSpinner from '../../directives/angular-spinner.directive';
import LoadingModalService from './LoadingModalService';

export default angular
  .module('fims.modals', [bootstrap, angularSpinner])
  .service('LoadingModal', LoadingModalService).name;
