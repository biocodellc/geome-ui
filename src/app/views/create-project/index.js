import angular from 'angular';
// import 'material-steppers';
import 'material-steppers/dist/material-steppers';
import 'material-steppers/dist/material-steppers.min.css';

import routing from './create-project.routes';
import fimsCreateProject from './create-project.component';
import fimsMdStep from '../../directives/mdStep.directive';
import fimsMdStepper from '../../directives/mdStepper.directive';
import fimsProjectConfigAttributes from '../../components/project-config-attributes';

export default angular
  .module('fims.createProject', [
    'mdSteppers',
    fimsMdStepper,
    fimsMdStep,
    fimsProjectConfigAttributes,
  ])
  .run(routing)
  .component('fimsCreateProject', fimsCreateProject).name;
