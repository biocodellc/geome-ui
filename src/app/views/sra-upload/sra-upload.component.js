const template = require('./sra-upload.html');
const JSZip = require('jszip');

// const resultsTemplate = require('./photo-upload-results.html');

class SraUploadController {
  constructor($mdDialog, $timeout, SraService, DataService) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.$timeout = $timeout;
    this.SraService = SraService;
    this.DataService = DataService;
  }

  $onInit() {
    this.newBioProject = true;
    this.canResume = false;
    this.ignoreId = false;
    this.limit = 20;
    this.page = 1;
    this.bioSampleType = 'animal';
    this.bioSamples = [];
    this.bioSamplesPromise = null;
    this.selectedBioSamples = [];
    this.sraMetadata = [];
    this.filteredSraMetadata = [];
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
    this.bioSamples = [];
    this.selectedBioSamples = [];
  }

  toBioSampleTypeStep($mdStep) {
    // start loading the bioSamples
    this.bioSamplesPromise = this.DataService.fetchSraData(
      this.currentProject.projectId,
      this.expedition.expeditionCode,
    );
    $mdStep.$stepper.next();
  }

  bioSampleHeaders() {
    if (!this.bioSamples.length) return [];
    return Object.keys(this.bioSamples[0]);
  }

  get sraMetadataHeaders() {
    if (this.cachedMetdataHeaders) return this.cachedMetdataHeaders;
    if (!this.filteredSraMetadata.length) return [];

    this.cachedMetdataHeaders = Array.from(
      this.filteredSraMetadata.reduce((accumulator, m) => {
        Object.keys(m).forEach(k => accumulator.add(k));
        return accumulator;
      }, new Set()),
    );

    return this.cachedMetdataHeaders;
  }

  bioSampleValues(sample) {
    return Object.values(sample);
  }

  async toBioSampleStep($mdStep) {
    // this will update the dom and causes a bit of a "freeze" for large lists
    // If it freezes, we want it to freeze on the step this is applicable for, not
    // in a previous step (where the data was loaded)
    // we wrap in a $timeout so the step transitions before freezing the dom
    this.loadingBioSamples = true;
    this.$timeout(() => {
      this.bioSamplesPromise.then(data => {
        this.bioSamples = data.bioSamples;
        this.sraMetadata = data.sraMetadata;
        this.selectedBioSamples = data.bioSamples.slice();
        $mdStep.$stepper.next();
        this.loadingBioSamples = false;
      });
    }, 50);
  }

  toMetadataStep($stepper) {
    const sampleNames = this.selectedBioSamples.map(b => b.sample_name);
    this.filteredSraMetadata = this.sraMetadata.filter(m =>
      sampleNames.includes(m.sample_name),
    );
    $stepper.next();
  }

  onSelect(file) {
    this.file = file;
  }

  async upload() {
    if (!this.file || !this.selectedBioSamples.length) return;

    this.uploadProgress = 0;
    this.loading = true;

    const resume = !!this.canResume;
    this.canResume = false;

    if (!resume && !(await this.verifyFilenames())) {
      this.$timeout(() => {
        this.loading = false;
      });
      return;
    }

    this.SraService.upload(
      {
        projectId: this.currentProject.projectId,
        expeditionCode: this.expedition.expeditionCode,
        bioProjectAccession: this.bioProjectAccession,
        bioProjectTitle: this.bioProjectTitle,
        bioProjectDescription: this.bioProjectDescription,
        bioSampleType: this.bioSampleType,
        bioSamples: this.selectedBioSamples.map(s => s.sample_name),
      },
      this.file,
      resume,
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
          this.showResultDialog(res);
          this.loading = false;
        }
      })
      .finally(() => {
        if (!this.canResume) {
          this.uploadProgress = undefined;
        }
        this.loading = false;
      });
  }

  async verifyFilenames() {
    const fileNamesToVerify = this.filteredSraMetadata.reduce(
      (names, m) => names.concat([m.filename, m.filename2]),
      [],
    );

    const dateBefore = new Date();
    try {
      const invalidFilenames = await JSZip.loadAsync(this.file).then(zip => {
        const dateAfter = new Date();
        console.log('loaded in ', dateAfter - dateBefore, ' ms');

        return fileNamesToVerify.filter(name => !(name in zip.files));
      });

      if (invalidFilenames.length === 0) return true;

      let html =
        '<p><strong>The following files were not found in the zip file:</strong></p><ul>';
      invalidFilenames.forEach(name => (html += `<li>${name}</li>`));
      html += '</ul>';

      await this.$mdDialog.show(
        this.$mdDialog
          .alert()
          .title('Missing Fastq Files!')
          .htmlContent(html)
          .ok('Ok'),
      );
      return false;
    } catch (e) {
      console.error(e);
      try {
        await this.$mdDialog.show(
          this.$mdDialog
            .confirm()
            .title('Upload Warning!')
            .htmlContent(
              `<p>We were not able to verify that you included the necessary fastq files as we could not read the provided zip file.</p>
              <p>Before uploading, please ensure <strong>that your zip file contains an entry for each sra metadata entry you are submitting.</strong> If not, the upload will fail validation and you will have to try again.</p>
              <p><strong>Would you like to continue?</strong></p>`,
            )
            .ok('Continue')
            .cancel('Cancel'),
        );
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  async showResultDialog(results) {
    const html = results.success
      ? `<p>It may take up to 24 hrs for GEOME to upload your submission to SRA. You will receive an email with the results of this submission upon completion.</p>`
      : `<p>The following error occurred:</p><p>${results.message}</p>`;

    await this.$mdDialog.show(
      this.$mdDialog
        .alert()
        .title(results.success ? 'Successfully Uploaded!' : 'Error')
        .htmlContent(html)
        .ok('Ok'),
    );

    if (results.success) {
      this.file = undefined;
      this.bioSampleType = 'animal';
      this.bioSamples = [];
      this.bioSamplesPromise = null;
      this.selectedBioSamples = [];
      this.sraMetadata = [];
      this.filteredSraMetadata = [];
      this.expedition = null;
    }
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
