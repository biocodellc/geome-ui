import angular from 'angular';

// import photosService from '../../services/photos.service';
// import mdFileUpload from '../../components/md-file-upload';
import plateService from '../../services/plates.service';

import routing from './plate-viewer.routes';
import plateViewer from './plate-viewer.component';

export default angular
  .module('fims.plates', [plateService])
  .run(routing)
  .component('fimsPlateViewer', plateViewer).name;
