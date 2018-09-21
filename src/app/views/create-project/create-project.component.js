import angular from 'angular';
import ProjectConfig from '../../models/ProjectConfig';

const template = require('./create-project.html');

const BASE_CONFIG = {
  entities: [
    {
      conceptAlias: 'Event',
      type: 'DefaultEntity',
      worksheet: 'Events',
      uniqueKey: 'eventID',
      attributes: [],
      rules: [],
      conceptURI: 'http://rs.tdwg.org/dwc/terms/Event',
    },
    {
      conceptAlias: 'Sample',
      type: 'DefaultEntity',
      worksheet: 'Samples',
      uniqueKey: 'materialSampleID',
      attributes: [],
      rules: [],
      conceptURI: 'http://rs.tdwg.org/dwc/terms/MaterialSample',
      parentEntity: 'Event',
    },
  ],
  lists: [],
  expeditionMetadata: [],
};

const UNIQUE_KEYS = {
  Event: ['eventID'],
  Sample: ['materialSampleID'],
  Tissue: ['tissueID'],
};

class CreateProjectController {
  constructor(
    $state,
    $anchorScroll,
    $mdDialog,
    NetworkConfigurationService,
    ProjectConfigurationService,
  ) {
    'ngInject';

    this.$state = $state;
    this.$anchorScroll = $anchorScroll;
    this.$mdDialog = $mdDialog;
    this.NetworkConfigurationService = NetworkConfigurationService;
    this.ProjectConfigurationService = ProjectConfigurationService;
  }

  $onInit() {
    this.project = {
      projectTitle: 'New Project',
      description: "so I don't have to type",
    };
    this.newConfig = false;
    this.syncConfig = true;
    this.worksheetSearchText = {};
    this.selectedAttributes = {};
    this.requiredAttributes = {};
  }

  createProject() {}

  getPossibleUniqueKeys(entity) {
    const keys = UNIQUE_KEYS[entity.conceptAlias].slice();
    if (entity.parentEntity) {
      const parent = this.config.entities.find(
        e => e.conceptAlias === entity.parentEntity,
      );
      keys.push(parent.uniqueKey);
    }
    return keys;
  }

  // eslint-disable-next-line class-methods-use-this
  updateAttributes(e, attributes) {
    e.attributes = attributes.map(a => Object.assign({}, a));
  }

  availableAttributes(conceptAlias) {
    return this.networkConfig.entities.find(
      e => e.conceptAlias === conceptAlias,
    ).attributes;
  }

  isRequiredAttribute(conceptAlias, attribute) {
    return this.requiredAttributes[conceptAlias].includes(attribute);
  }

  async toConfigStep($mdStep) {
    this.fetchNetworkConfig();

    this.networkPromise.then(() => {
      this.setRequiredAttributes();
      BASE_CONFIG.lists = this.networkConfig.lists.slice();
      BASE_CONFIG.entities.forEach(e => {
        e.attributes = this.requiredAttributes[e.conceptAlias].slice();
        e.rules = this.networkConfig.entities
          .find(entity => entity.conceptAlias === e.conceptAlias)
          .rules.slice();
      });
    });

    if (this.newConfig) {
      this.config = new ProjectConfig(BASE_CONFIG);
    } else {
      this.loading = true;
      await this.fetchConfig();
      this.loading = false;

      if (!this.config) return;
      this.selectModulesForExistingConfig();
    }

    $mdStep.$stepper.next();
  }

  tissuesChanged() {
    if (!this.tissues) this.removeEntity('Tissue');
    else {
      let e;
      if (this.existingConfig) {
        e = this.existingConfig.config.entities.find(
          entity => entity.conceptAlias === 'Tissue',
        );
      }
      if (!e) {
        e = {
          conceptAlias: 'Tissue',
          type: 'DefaultEntity',
          worksheet: 'Tissues',
          uniqueKey: 'tissueID',
          attributes: this.requiredAttributes.Tissue.map(a =>
            Object.assign({}, a),
          ),
          rules: this.networkConfig.entities
            .find(entity => entity.conceptAlias === 'Tissue')
            .rules.slice(),
          conceptURI: 'http://rs.tdwg.org/dwc/terms/MaterialSample',
          parentEntity: 'Sample',
        };
      }
      this.config.entities.push(e);
    }
  }

  nextgenChanged() {
    if (!this.nextgen) this.removeEntity('fastqMetadata');
    else {
      let e;
      if (this.existingConfig) {
        e = this.existingConfig.config.entities.find(
          entity => entity.conceptAlias === 'fastqMetadata',
        );
      }
      if (!e) {
        e = {
          conceptAlias: 'fastqMetadata',
          type: 'Fastq',
          attributes: this.requiredAttributes.fastqMetadata.map(a =>
            Object.assign({}, a),
          ),
          rules: this.networkConfig.entities
            .find(entity => entity.conceptAlias === 'fastqMetadata')
            .rules.slice(),
          conceptURI: 'urn:fastqMetadata',
          parentEntity: 'Tissue',
        };
      }
      this.config.entities.push(e);
    }
  }

  barcodeChanged() {
    if (!this.barcode) this.removeEntity('fastaSequence');
    else {
      let e;
      if (this.existingConfig) {
        e = this.existingConfig.config.entities.find(
          entity => entity.conceptAlias === 'fastaSequence',
        );
      }
      if (!e) {
        e = {
          conceptAlias: 'fastaSequence',
          type: 'Fasta',
          attributes: this.requiredAttributes.fastaSequence.map(a =>
            Object.assign({}, a),
          ),
          rules: this.networkConfig.entities
            .find(entity => entity.conceptAlias === 'fastaSequence')
            .rules.slice(),
          conceptURI: 'urn:fastaSequence',
          parentEntity: 'Tissue',
        };
      }
      this.config.entities.push(e);
    }
  }

  photosChanged() {
    if (!this.photos) {
      this.samplePhotos = false;
      this.eventPhotos = false;
      this.eventPhotosChanged();
      this.samplePhotosChanged();
    }
  }

  eventPhotosChanged() {
    if (!this.eventPhotos) this.removeEntity('Event_Photo');
    else {
      let e;
      if (this.existingConfig) {
        e = this.existingConfig.config.entities.find(
          entity => entity.conceptAlias === 'EventPhoto',
        );
      }
      if (!e) {
        e = {
          conceptAlias: 'Event_Photo',
          type: 'Photo',
          attributes: this.requiredAttributes.EventPhoto.map(a =>
            Object.assign({}, a),
          ),
          rules: this.networkConfig.entities
            .find(entity => entity.conceptAlias === 'Event_Photo')
            .rules.slice(),
          worksheet: 'event_photos',
          uniqueKey: 'photoID',
          conceptURI: 'http://rs.tdwg.org/dwc/terms/associatedMedia',
          parentEntity: 'Event',
        };
      }
      this.config.entities.push(e);
    }
  }

  samplePhotosChanged() {
    if (!this.samplePhotos) this.removeEntity('Sample_Photo');
    else {
      let e;
      if (this.existingConfig) {
        e = this.existingConfig.config.entities.find(
          entity => entity.conceptAlias === 'Sample_Photo',
        );
      }
      if (!e) {
        e = {
          conceptAlias: 'Sample_Photo',
          type: 'Photo',
          attributes: this.requiredAttributes.Sample_Photo.map(a =>
            Object.assign({}, a),
          ),
          rules: this.networkConfig.entities
            .find(entity => entity.conceptAlias === 'Sample_Photo')
            .rules.slice(),
          worksheet: 'sample_photos',
          uniqueKey: 'photoID',
          conceptURI: 'http://rs.tdwg.org/dwc/terms/associatedMedia',
          parentEntity: 'Sample',
        };
      }
      this.config.entities.push(e);
    }
  }

  removeEntity(conceptAlias) {
    const i = this.config.entities.findIndex(
      e => e.conceptAlias === conceptAlias,
    );

    if (i > -1) this.config.entities.splice(i, 1);
  }

  selectModulesForExistingConfig() {
    // reset selected modules
    this.tissues = false;
    this.photos = false;
    this.eventPhotos = false;
    this.samplePhotos = false;
    this.nextgen = false;
    this.barcode = false;

    this.config.entities.forEach(e => {
      switch (e.conceptAlias) {
        case 'Tissue':
          this.tissues = true;
          break;
        case 'Event_Photo':
          this.photos = true;
          this.eventPhotos = true;
          break;
        case 'Sample_Photo':
          this.photos = true;
          this.samplePhotos = true;
          break;
        case 'fastaSequence':
          this.barcode = true;
          break;
        case 'fastqMetadata':
          this.nextgen = true;
          break;
        default:
      }
    });
  }

  getWorksheets() {
    if (!this.worksheetChange && this.worksheets) return this.worksheets;

    const worksheets = new Set();
    this.config.entities.map(e => e.worksheet).forEach(w => worksheets.add(w));
    this.worksheetChange = false;
    this.worksheets = Array.from(worksheets);
    return this.worksheets;
  }

  worksheetSelected(item) {
    if (item) this.worksheetChange = true;
  }

  addWorksheet(entity, sheetName) {
    entity.worksheet = sheetName;
    return sheetName;
  }

  setRequiredAttributes() {
    this.networkConfig.entities.forEach(e => {
      this.setEntityRequiredAttributes(e);
    });
  }

  setEntityRequiredAttributes(e) {
    if (e.worksheet) {
      this.requiredAttributes[
        e.conceptAlias
      ] = this.networkConfig.config
        .requiredAttributes(e.worksheet)
        .filter(a => e.attributes.includes(a));
    } else {
      this.requiredAttributes[e.conceptAlias] = [];
    }

    if (
      !this.requiredAttributes[e.conceptAlias].find(
        a => a.column === e.uniqueKey,
      )
    ) {
      const attribute = e.attributes.find(a => a.column === e.uniqueKey);
      this.requiredAttributes[e.conceptAlias].push(attribute);
    }
  }

  fetchConfig() {
    if (!this.existingConfig || this.existingConfig.config) {
      if (this.existingConfig && this.existingConfig.name !== this.configName) {
        this.config = new ProjectConfig(this.existingConfig.config);
      }
      return Promise.resolve();
    }

    return this.ProjectConfigurationService.get(this.existingConfig.id)
      .then(data => {
        this.existingConfig = data;
        this.config = new ProjectConfig(data.config);
        this.configName = this.existingConfig.name;

        const i = this.configurations.findIndex(
          c => c.name === this.existingConfig.name,
        );
        this.configurations.splice(i, 1, this.existingConfig);
      })
      .catch(() =>
        angular.toaster.error(
          'Failed to load the configuration. Please refresh the page and try again',
        ),
      );
  }

  fetchNetworkConfig() {
    this.networkPromise = this.NetworkConfigurationService.get()
      .then(config => {
        this.networkConfig = config;
      })
      .catch(() =>
        angular.toaster.error(
          'Failed to load the network configuration. Please try again later.',
        ),
      );
  }
}

export default {
  template,
  controller: CreateProjectController,
  bindings: {
    currentUser: '<',
    configurations: '<',
  },
};
