import angular from 'angular';
import ProjectConfig from '../../models/ProjectConfig';
import Rule from '../../models/Rule';

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
    {
      conceptAlias: 'Tissue',
      type: 'Tissue',
      worksheet: 'Tissues',
      uniqueKey: 'tissueID',
      attributes: [],
      rules: [],
      conceptURI: 'http://rs.tdwg.org/dwc/terms/MaterialSample',
      parentEntity: 'Sample',
    },
  ],
  lists: [],
  expeditionMetadataProperties: [],
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
    $location,
    $timeout,
    $mdDialog,
    NetworkConfigurationService,
    ProjectConfigurationService,
    ProjectService,
  ) {
    'ngInject';

    this.$state = $state;
    this.$anchorScroll = $anchorScroll;
    this.$location = $location;
    this.$timeout = $timeout;
    this.$mdDialog = $mdDialog;
    this.NetworkConfigurationService = NetworkConfigurationService;
    this.ProjectConfigurationService = ProjectConfigurationService;
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.project = {
      projectTitle: undefined,
      description: undefined,
      public: false,
    };
    this.cloneConfig = false;
    this.teamConfig = false;
    this.syncConfig = true;
    this.configLayout = 'single';
    this.worksheetSearchText = {};
    this.requiredAttributes = {};
    this.requiredRules = {};

    this.fetchNetworkConfig();
  }

  async createProject() {
    if (this.isNetworkAdmin && !this.syncConfig) {
      try {
        await this.$mdDialog.show(
          this.$mdDialog
            .confirm()
            .title('Create Project Configuration')
            .textContent(
              `Once a configuration is created, you will no longer be able to change the 
              "uniqueKey" or "worksheet" for an entity. If you would like to change these
              please do this before creating the project.`,
            )
            .ok('Create Project!')
            .cancel('Cancel'),
        );
        // user accepted, proceed
      } catch (e) {
        // user canceled
        return;
      }
    }

    this.creatingProject = true;

    if (this.teamConfig || (this.cloneConfig && this.syncConfig)) {
      this.project.projectConfiguration = this.existingConfig;
    } else {
      // creating a new ProjectConfiguration
      if (!this.config) {
        await this.setupNewConfig(false);
        this.config.entities.forEach(e => {
          e.attributes = this.availableAttributes(e.conceptAlias).slice();
        });
      }
      this.project.projectConfig = this.config;
    }

    this.ProjectService.create(this.project)
      .then(({ data }) => {
        data.config = new ProjectConfig(data.projectConfig);
        delete data.projectConfig;
        return this.ProjectService.setCurrentProject(data);
      })
      .then(() =>
        this.$state.go('template', {}, { reload: true, inherit: false }),
      )
      .catch(resp => {
        if (resp.status === 400 && resp.data.errors) {
          this.errors = resp.data.errors;
          this.$location.hash('errors');
          this.$anchorScroll();
        }
      })
      .finally(() => {
        this.creatingProject = false;
      });
  }

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

  updateAttributes(e, attributes) {
    e.attributes = attributes.map(a => Object.assign({}, a));
  }

  updateRules(e, rules) {
    e.rules = rules.map(r => new Rule(angular.copy(r)));
  }

  updateProperties(properties) {
    this.config.expeditionMetadataProperties = properties;
  }

  availableAttributes(conceptAlias) {
    if (!this.networkConfig) return [];
    return this.networkConfig.entities.find(
      e => e.conceptAlias === conceptAlias,
    ).attributes;
  }

  isRequiredAttribute(conceptAlias, attribute) {
    return this.requiredAttributes[conceptAlias].includes(attribute);
  }

  async setupNewConfig(setLoading = true) {
    this.networkPromise.then(() => {
      this.setRequiredAttributes(this.networkConfig);
      this.setRequiredRules();
      BASE_CONFIG.lists = this.networkConfig.lists.slice();
      BASE_CONFIG.entities.forEach(e => {
        e.attributes = this.requiredAttributes[e.conceptAlias].slice();
      });
    });

    if (this.cloneConfig) {
      if (setLoading) this.loading = true;
      await this.fetchConfig();
      if (setLoading) this.loading = false;

      if (!this.config) return;
      this.selectModulesForConfig();
      this.setRequiredAttributes(this.config);
    } else {
      if (setLoading) this.loading = true;
      await this.networkPromise;
      this.config = new ProjectConfig(angular.copy(BASE_CONFIG));
      this.setupSheetLayout();
      this.selectModulesForConfig();
      if (setLoading) this.loading = false;
    }
  }

  async toConfigStep($mdStep) {
    await this.setupNewConfig();
    // trying this hack to address https://github.com/biocodellc/geome-ui/issues/313
    this.$timeout(() => $mdStep.$stepper.next(), 50);
  }

  setupSheetLayout() {
    this.config.entities.forEach(e => {
      e.attributes = angular.copy(
        this.networkConfig.entities.find(
          entity => e.conceptAlias === entity.conceptAlias,
        ).attributes,
      );

      if (this.configLayout === 'single') {
        if (e.conceptAlias === 'Event') {
          e.hashed = true;
          e.worksheet = 'Samples';
        } else if (e.conceptAlias === 'Tissue') {
          e.worksheet = 'Samples';
          e.generateID = true;
          e.generateEmptyTissue = false;
        } else if (e.conceptAlias === 'Diagnostics') {
          e.worksheet = 'Samples';
          e.hashed = true;
        }
      }
    });
  }

  hashChanged(e) {
    if (e.hashed) {
      const ne = this.networkConfig.entities.find(
        entity => e.conceptAlias === entity.conceptAlias,
      );

      if (ne.uniqueKey !== e.uniqueKey) {
        e.uniqueKey = ne.uniqueKey;
        this.uniqueKeyChange(e);
      }
    }
  }

  showGenerateID(e) {
    if (e.type !== 'Tissue' || e.uniqueKey !== 'tissueID') return false;

    const sampleEntity = this.config.entities.find(
      entity => entity.conceptAlias === e.parentEntity,
    );
    return sampleEntity && sampleEntity.worksheet === e.worksheet;
  }

  getEntity(conceptAlias) {
    return (
      this.config.entities.find(e => e.conceptAlias === conceptAlias) || {}
    );
  }

  uniqueKeyChange(e) {
    this.setRequiredAttributes(this.config);

    const validForUriRule = e.rules.find(
      r => r.name === 'ValidForURI' && r.level === 'ERROR',
    );

    if (validForUriRule) {
      validForUriRule.column = e.uniqueKey;
    }

    const uniqueValueRule = e.rules.find(
      r => r.name === 'UniqueValue' && r.level === 'ERROR',
    );

    if (uniqueValueRule) {
      uniqueValueRule.column = e.uniqueKey;
    }

    if (e.conceptAlias === 'Tissue' && e.uniqueKey === 'tissueID') {
      const unselectMaterialSampleID = conceptAlias => {
        const entity = this.config.entities.find(
          en => en.conceptAlias === conceptAlias,
        );
        const { attributes } = entity;

        const i = attributes.findIndex(a => a.uri === 'urn:materialSampleID');
        if (i > -1) {
          attributes.splice(i, 1);

          // also need to remove any rules that reference materialSampleID
          let changedRule = false;
          const ruleIndexesToRemove = [];
          entity.rules.forEach((r, index) => {
            if (r.columns) {
              const idx = r.columns.indexOf('materialSampleID');
              if (idx > -1) {
                r.columns.splice(idx, 1);
                changedRule = true;
              }
            } else if (r.column && r.column === 'materialSampleID') {
              ruleIndexesToRemove.push(index);
            }
          });
          ruleIndexesToRemove.forEach(index => entity.rules.splice(index, 1));
          if (changedRule || ruleIndexesToRemove.length) {
            entity.rules = entity.rules.slice();
          }
        }
      };

      if (this.barcode) unselectMaterialSampleID('fastaSequence');
      if (this.nextgen) unselectMaterialSampleID('fastqMetadata');
    }
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
          type: 'Tissue',
          worksheet: this.configLayout === 'single' ? 'Samples' : 'Tissues',
          generateID: this.configLayout === 'single',
          generateEmptyTissue: false,
          uniqueKey: 'tissueID',
          attributes: this.requiredAttributes.Tissue.map(a =>
            Object.assign({}, a),
          ),
          rules: [],
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
          rules: [],
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
          rules: [],
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
          attributes: this.requiredAttributes.Event_Photo.map(a =>
            Object.assign({}, a),
          ),
          rules: [],
          worksheet: 'event_photos',
          uniqueKey: 'photoID',
          conceptURI: 'http://rs.tdwg.org/dwc/terms/associatedMedia',
          parentEntity: 'Event',
        };
      }
      this.config.entities.push(e);
    }
  }

  diagnosticsChanged() {
    if (!this.diagnostics) this.removeEntity('Diagnostics');
    else {
      let e;
      if (this.existingConfig) {
        e = this.existingConfig.config.entities.find(
          entity => entity.conceptAlias === 'Diagnostics',
        );
      }
      if (!e) {
        e = {
          conceptAlias: 'Diagnostics',
          type: 'DefaultEntity',
          attributes: this.requiredAttributes.Diagnostics.map(a =>
            Object.assign({}, a),
          ),
          rules: [],
          worksheet: this.configLayout === 'single' ? 'Samples' : 'Diagnostics',
          generateID: this.configLayout === 'single',
          uniqueKey: 'diagnosticID',
          conceptURI: 'http://rs.tdwg.org/dwc/terms/MeasurementOrFact',
          parentEntity: 'Sample',
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
          rules: [],
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

  selectModulesForConfig() {
    // reset selected modules
    this.tissues = false;
    this.photos = false;
    this.eventPhotos = false;
    this.samplePhotos = false;
    this.nextgen = false;
    this.barcode = false;
    this.diagnostics = false;

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
        case 'diagnostics':
          this.diagnostics = true;
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

  setRequiredAttributes(config) {
    config.entities.forEach(e => {
      this.setEntityRequiredAttributes(e);
    });
  }

  setEntityRequiredAttributes(e) {
    const requiredAttributes = e.worksheet
      ? this.networkConfig.requiredAttributesForEntity(e.conceptAlias)
      : [];

    const ne = this.networkConfig.entities.find(
      entity => entity.conceptAlias === e.conceptAlias,
    );

    const addUniqueKey = entity => {
      const attribute = ne.attributes.find(a => a.column === entity.uniqueKey);
      requiredAttributes.push(attribute);
      if (!e.attributes.find(attr => attribute.uri === attr.uri)) {
        e.attributes.push(attribute);
      }
    };

    if (!requiredAttributes.find(a => a.column === e.uniqueKey)) {
      addUniqueKey(e);
    }

    if (ne.uniqueKey !== e.uniqueKey) {
      const i = requiredAttributes.findIndex(a => a.column === ne.uniqueKey);
      if (i > -1) requiredAttributes.splice(i, 1);
    }

    if (e.parentEntity) {
      const p = (this.config || this.networkConfig).entities.find(
        entity => e.parentEntity === entity.conceptAlias,
      );

      if (!requiredAttributes.find(a => a.column === p.uniqueKey)) {
        addUniqueKey(p);
      }
    }

    this.requiredAttributes[e.conceptAlias] = requiredAttributes;
  }

  setRequiredRules() {
    this.networkConfig.entities.forEach(e => {
      this.setEntityRequiredRules(e);
    });
  }

  setEntityRequiredRules(e) {
    this.requiredRules[e.conceptAlias] = this.networkConfig.entities.find(
      entity => entity.conceptAlias === e.conceptAlias,
    ).rules;

    // if (
    //   !this.requiredRules[e.conceptAlias].find(
    //     r =>
    //       r.name === 'RequiredValue' &&
    //       r.columns.includes(e.uniqueKey) &&
    //       r.level === 'ERROR',
    //   )
    // ) {
    //   this.requiredRules.push(
    //     new Rule({
    //       name: 'RequiredValue',
    //       columns: [],
    //     }),
    //   );
    // }
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

  getConfigurations() {
    if (this.isNetworkAdmin && !this.teamConfig) return this.configurations;
    return this.configurations.filter(c => c.networkApproved);
  }
}

export default {
  template,
  controller: CreateProjectController,
  bindings: {
    layout: '@',
    currentUser: '<',
    configurations: '<',
    isNetworkAdmin: '<',
  },
};
