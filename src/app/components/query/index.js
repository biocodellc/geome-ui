import angular from 'angular';

import modals from '../modals';
import { typeahead, typeaheadItem } from './typeahead.directive';
import QueryController from './QueryController';
import routing from './routes'

export default angular.module('fims.query', [ modals, 'sly', typeahead, typeaheadItem ])
  .config(routing)
  .controller('QueryController', QueryController)
  .name;
