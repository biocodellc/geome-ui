import angular from 'angular';

import routing from './create-project.routes';
import fimsCreateProject from './create-project.component';
import materialSteppers from '../../components/material-steppers';
import fimsProjectConfigAttributes from '../../components/project-config-attributes';
import fimsProjectConfigRules from '../../components/project-config-rules';
import fimsProjectConfigExpeditionMetadata from '../../components/project-config-expedition-metadata';

export default angular
  .module('fims.createProject', [
    materialSteppers,
    fimsProjectConfigAttributes,
    fimsProjectConfigRules,
    fimsProjectConfigExpeditionMetadata,
  ])
  .run(routing)
  .component('fimsCreateProject', fimsCreateProject).name;
