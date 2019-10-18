import angular from 'angular';

import materialSteppers from '../../components/material-steppers';
// import photosService from '../../services/photos.service';
import mdFileUpload from '../../components/md-file-upload';

import routing from './sra-upload.routes';
import upload from './sra-upload.component';

export default angular
  .module('fims.sra', [materialSteppers, mdFileUpload])
  .run(routing)
  .component('fimsSRAUpload', upload).name;
