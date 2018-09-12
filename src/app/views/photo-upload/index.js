import angular from 'angular';

import photosService from '../../services/photos.service';
import mdFileUpload from '../../components/md-file-upload';

import routing from './photo-upload.routes';
import upload from './photo-upload.component';

export default angular
  .module('fims.photos', [photosService, mdFileUpload])
  .run(routing)
  .component('fimsPhotoUpload', upload).name;
