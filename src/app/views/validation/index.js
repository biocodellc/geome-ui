import angular from 'angular';

import ngFileUpload from 'ng-file-upload';

import routing from './validation.routes';
import fimsValidation from './validation.component';
import fimsValidate from './validate/validate.component';
import fimsUpload from './upload/upload.component';
import fimsUploadDatatypes from './upload/uploadDatatypes.component';
import fimsUploadExpedition from './upload/uploadExpedition.component';
import fimsMetadata from './fimsMetadata/fimsMetadata.component';
import fimsFastaData from './upload/fasta/fastaData.component';
import fimsFastqData from './upload/fastq/fastqData.component';
import expeditionCreateModal from '../../components/expeditions/create-expedition-modal.component';
import uploadMapDialog from '../../components/upload-map-dialog';
import results from './results';

export default angular
  .module('fims.validation', [
    ngFileUpload,
    results,
    expeditionCreateModal,
    uploadMapDialog,
  ])
  .run(routing)
  .component('fimsMetadata', fimsMetadata)
  .component('fimsValidation', fimsValidation)
  .component('fimsValidate', fimsValidate)
  .component('fimsUpload', fimsUpload)
  .component('fimsUploadDatatypes', fimsUploadDatatypes)
  .component('fimsUploadExpedition', fimsUploadExpedition)
  .component('fimsFastaData', fimsFastaData)
  .component('fimsFastqData', fimsFastqData).name;
