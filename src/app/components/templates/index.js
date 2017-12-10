import angular from 'angular';

import projects from '../projects';
import files from '../files';

import routing from './template.routes';
import TemplateController from "./TemplateController";
import TemplateService from "./TemplateService";
import AttributeDefController from "./AttributeDefController";
import AttributeDefinition from "./attributeDefinition.component";


export default angular.module('fims.templates', [ projects, files ])
  .run(routing)
  .controller('TemplateController', TemplateController)
  .controller('AttributeDefController', AttributeDefController)
  .component('attributeDefinition', AttributeDefinition)
  .service('TemplateService', TemplateService)
  .name;
