import angular from 'angular';

import projects from '../project';
import files from '../../components/files';
import attributeDefinition from '../../components/attribute-definition';

import routing from './template.routes';
import TemplateService from "./templates.service";
import fimsTemplates from './templates.component';


export default angular.module('fims.templates', [ projects, files, attributeDefinition ])
  .run(routing)
  .component('fimsTemplates', fimsTemplates)
  .service('TemplateService', TemplateService)
  .name;
