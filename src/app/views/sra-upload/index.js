import angular from 'angular';

import materialSteppers from '../../components/material-steppers';
import sraService from '../../services/sra.service';
import mdFileUpload from '../../components/md-file-upload';

import routing from './sra-upload.routes';
import upload from './sra-upload.component';

export default angular
  .module('fims.sra', [sraService, materialSteppers, mdFileUpload])
  .run(routing)
  .component('fimsSraUpload', upload).name;
