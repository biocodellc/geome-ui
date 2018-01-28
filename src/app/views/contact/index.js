import angular from 'angular';

import routing from './contact.routes';
import contact from './contact.component';

export default angular
  .module('fims.contact', [])
  .run(routing)
  .component('contact', contact).name;
