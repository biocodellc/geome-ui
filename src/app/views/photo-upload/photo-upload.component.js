const template = require('./photo-upload.html');

class PhotoUploadController {
  constructor(PhotosService) {
    'ngInject';

    this.PhotosService = PhotosService;
  }

  $onInit() {}

  $onChanges(changesObj) {
    if (
      this.currentProject &&
      'currentProject' in changesObj &&
      changesObj.currentProject.previousValue !== this.currentProject
    ) {
      this.setPhotoEntities();
    }
  }

  onSelect(file) {
    this.file = file;
  }

  upload() {
    if (
      !this.file ||
      !this.entity ||
      (this.entity.requiresExpedition && !this.expeditionCode)
    ) {
      return;
    }

    this.uploadProgress = 0;
    this.loading = true;

    this.PhotosService.upload(
      this.currentProject.projectId,
      this.expeditionCode,
      this.entity.conceptAlias,
      this.file,
    )
      .progress(event => {
        this.uploadProgress = parseInt(100.0 * event.loaded / event.total, 10);
      })
      .then(console.log)
      .finally(res => {
        this.uploadProgress = undefined;
        this.loading = false;
        console.log(res);
      });
  }

  setPhotoEntities() {
    const { entities } = this.currentProject.config;
    this.photoEntities = entities.filter(e => e.type === 'Photo').map(e => ({
      conceptAlias: e.conceptAlias,
      additionalMetadata: e.attributes.filter(
        a =>
          !a.internal &&
          !['originalUrl', 'photoID', 'img64', 'img512', 'img1024'].includes(
            a.column,
          ),
      ),
      requiresExpedition: !entities.find(p => p.conceptAlias === e.parentEntity)
        .uniqueAcrossProject,
    }));
    if (this.photoEntities.length === 1) this.entity = this.photoEntities[0];
  }
}

export default {
  template,
  controller: PhotoUploadController,
  bindings: {
    currentProject: '<',
    userExpeditions: '<',
  },
};
