import angular from 'angular';

import projectsService from '../../services/projects.service';
import userService from '../../services/users.service';
import attributeDefinition from '../../components/attribute-definition';

import routing from './template.routes';
import templateService from "./templates.service";
import fimsTemplates from './templates.component';


export default angular.module('fims.templates', [ projectsService, templateService, attributeDefinition, userService ])
  .run(routing)
  .component('fimsTemplates', fimsTemplates)
  .name;
