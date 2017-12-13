import angular from 'angular';

import projects from '../projects';
import files from '../files';

import routing from './template.routes';
import TemplateService from "./TemplateService";
import AttributeDefinition from "./attributeDefinition.component";


export default angular.module('fims.templates', [ projects, files ])
  .run(routing)
  .component('attributeDefinition', AttributeDefinition)
  .service('TemplateService', TemplateService)
  .name;
