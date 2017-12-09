import angular from 'angular';
import bootstrap from 'bootstrap';
// TODO can I import this somehow?
// import uibModal from 'angular-ui-bootstrap';

import angularSpinner from '../../directives/angular-spinner.directive';
import LoadingModalService from './LoadingModalService';
import FailModalService from './FailModalService';
import FailModalController from './FailModalController';

export default angular.module('fims.modals', [ bootstrap, angularSpinner, '$uibModal' ])
  .service('LoadingModal', LoadingModalService)
  .service('FailModalFactory', FailModalService) // TODO rename to FailModalService
  .service('FailModalCtrl', FailModalController)
  .name;
