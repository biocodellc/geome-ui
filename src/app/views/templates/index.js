import angular from 'angular';

import projectService from '../../services/project.service';
import userService from '../../services/user.service';
import templateService from "../../services/template.service";
import attributeDefinition from '../../components/attribute-definition';

import routing from './template.routes';
import fimsTemplates from './templates.component';


export default angular.module('fims.templates', [ projectService, templateService, attributeDefinition, userService ])
  .run(routing)
  .component('fimsTemplates', fimsTemplates)
  .name;
