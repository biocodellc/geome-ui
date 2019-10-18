const template = require('./sra-upload.html');
// const resultsTemplate = require('./photo-upload-results.html');

class SraUploadController {
  constructor($mdDialog, PhotosService) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.PhotosService = PhotosService;
  }

  $onInit() {
    this.newBioProject = true;
    this.canResume = false;
    this.ignoreId = false;
  }

  $onChanges(changesObj) {
    if (
      this.currentProject &&
      'currentProject' in changesObj &&
      changesObj.currentProject.previousValue !== this.currentProject
    ) {
      this.bioProjectDescription = this.currentProject.description;
    }
  }

  handleExpeditionChange() {
    this.bioProjectTitle = this.expedition.expeditionTitle;
  }

  onSelect(file) {
    this.file = file;
  }

  async upload() {
    if (
      !this.file ||
      !this.entity ||
      (this.entity.requiresExpedition && !this.expeditionCode)
    ) {
      return;
    }

    if (
      this.currentProject.enforceExpeditionAccess &&
      this.currentProject.user.userId !== this.currentUser.userId
    ) {
      try {
        await this.$mdDialog.show(
          this.$mdDialog
            .confirm()
            .title('Upload Warning!')
            .htmlContent(
              `<p><strong>Do you own the expeditions you are uploading photos for?</strong></p>
              <p>You can only only upload photos for data in expeditions that you own. If you do not own the expedition(s) that contain the ${
                this.entity.parentEntity
              }s you are uploading photos for, the upload will fail only after the file is completely uploaded.</p>
              <p><strong>Would you like to continue?</strong></p>`,
            )
            .ok('Continue')
            .cancel('Cancel'),
        );
      } catch (e) {
        return;
      }
    }

    this.uploadProgress = 0;
    this.loading = true;

    const resume = !!this.canResume;
    this.canResume = false;

    this.PhotosService.upload(
      this.currentProject.projectId,
      this.expeditionCode,
      this.entity.conceptAlias,
      this.file,
      resume,
      this.ignoreId,
    )
      .progress(event => {
        this.uploadProgress = parseInt(
          (100.0 * event.loaded) / event.total,
          10,
        );
      })
      .then(res => {
        this.showResultDialog(res);
      })
      .catch(res => {
        if (
          (res.status === -1 || res.status > 500) &&
          this.uploadProgress < 100
        ) {
          this.canResume = true;
          this.showResumeDialog();
        }
      })
      .finally(() => {
        if (!this.canResume) {
          this.uploadProgress = undefined;
        }
        this.loading = false;
      });
  }

  showResultDialog(results) {
    this.$mdDialog
      .show({
        template: resultsTemplate,
        locals: {
          results,
          $mdDialog: this.$mdDialog,
        },
        bindToController: true,
        controller: function Controller() {},
        controllerAs: '$ctrl',
        escapeToClose: false,
        autoWrap: false,
      })
      .then(() => {
        this.file = undefined;
        this.entity = undefined;
        this.expeditionCode = undefined;
      });
  }

  showResumeDialog() {
    this.$mdDialog.show(
      this.$mdDialog
        .alert()
        .title('Upload Failed')
        .textContent(
          'An interruption occurred while uploading your file. You can resume the upload, or start over.',
        )
        .ok('Ok'),
    );
  }

  setPhotoEntities() {
    const { entities } = this.currentProject.config;
    this.photoEntities = entities
      .filter(e => e.type === 'Photo')
      .map(e => {
        const parentEntity = entities.find(
          p => p.conceptAlias === e.parentEntity,
        );

        const excludeCols = ['originalUrl', 'photoID', parentEntity.uniqueKey];

        return {
          conceptAlias: e.conceptAlias,
          parentEntity: e.parentEntity,
          generateID: e.generateID,
          additionalMetadata: e.attributes.filter(
            a => !a.internal && !excludeCols.includes(a.column),
          ),
          requiresExpedition: !parentEntity.uniqueAcrossProject,
        };
      });
    if (this.photoEntities.length === 1) this.entity = this.photoEntities[0];
  }
}

export default {
  template,
  controller: SraUploadController,
  bindings: {
    currentProject: '<',
    currentUser: '<',
    userExpeditions: '<',
  },
};
