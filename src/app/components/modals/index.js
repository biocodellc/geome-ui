import angular from 'angular';
import bootstrap from 'angular-ui-bootstrap';

import angularSpinner from '../../directives/angular-spinner.directive';
import LoadingModalService from './LoadingModalService';
import FailModalService from './FailModalService';
import FailModalController from './FailModalController';

export default angular.module('fims.modals', [ bootstrap, angularSpinner ])
  .service('LoadingModal', LoadingModalService)
  .service('FailModalFactory', FailModalService) // TODO rename to FailModalService
  .service('FailModalCtrl', FailModalController)
  .name;
