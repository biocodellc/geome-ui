import angular from 'angular';

const template = require('./record.html');

const getKey = key => event => ({ text: event[key] });

const parentRecordDetails = {
  Event: {
    eventID: event => ({ text: event.eventID, href: `/record/${event.bcid}` }),
    yearCollected: getKey('yearCollected'),
    country: getKey('country'),
    decimalLatitude: getKey('decimalLatitude'),
    decimalLongitude: getKey('decimalLongitude'),
  },
  Sample: {
    materialSampleID: sample => ({
      text: sample.materialSampleID,
      href: `/record/${sample.bcid}`,
    }),
    genus: getKey('genus'),
    species: getKey('species'),
  },
  Tissue: {
    tissueID: tissue => ({
      text: tissue.tissueID,
      href: `/record/${tissue.bcid}`,
    }),
    tissueType: getKey('tissueType'),
    tissueInstitution: getKey('tissueInstitution'),
  },
};

const childRecordDetails = {
  Sample: {
    materialSampleID: sample => ({
      text: sample.materialSampleID,
      href: `/record/${sample.bcid}`,
    }),
    genus: getKey('genus'),
    species: getKey('species'),
  },
  Tissue: {
    tissueID: tissue => ({
      text: tissue.tissueID,
      href: `/record/${tissue.bcid}`,
    }),
    tissueType: getKey('tissueType'),
    tissueInstitution: getKey('tissueInstitution'),
  },
  fastaSequence: {
    marker: sq => ({
      text: sq.marker,
      href: `/record/${sq.bcid}`,
    }),
  },
  fastqMetadata: {
    materialSampleID: m => ({
      text: m.materialSampleID,
      href: `/record/${m.bcid}`,
    }),
  },
  sample_photos: {
    photoID: p => ({
      text: p.photoID,
      href: `/record/${p.bcid}`,
    }),
    qualityScore: getKey('qualityScore'),
    hasScale: getKey('hasScale'),
  },
  event_photos: {
    photoID: p => ({
      text: p.photoID,
      href: `/record/${p.bcid}`,
    }),
    qualityScore: getKey('qualityScore'),
    hasScale: getKey('hasScale'),
  },
};

const mainRecordDetails = {
  Event: [],
  Sample: [
    'materialSampleID',
    'species',
    'genus',
    'principalInvestigator',
    'bcid',
  ],
  Tissue: [],
  fastaSequence: ['marker', 'identifier', 'sequence', 'bcid'],
  fastqMetadata: ['materialSampleID', 'bioSample', 'bcid'],
};

const mapChildren = children =>
  children.reduce((accumulator, child) => {
    if (!accumulator[child.entity]) accumulator[child.entity] = [];
    accumulator[child.entity].push(child);
    return accumulator;
  }, {});

const detailCache = {};
let detailCacheNumCols;
class RecordController {
  constructor($mdMedia, ProjectConfigService) {
    'ngInject';

    this.$mdMedia = $mdMedia;
    this.ProjectConfigService = ProjectConfigService;
  }

  $onInit() {
    this.loading = true;
    this.inlineGallery = true;
  }

  $onChanges(changesObj) {
    if ('record' in changesObj && this.record) {
      this.setParentDetail(this.record.parent);
      this.setChildDetails(this.record.children);
      this.parent = this.record.paren;
      this.children = this.record.children;
      this.record = this.record.record;
      this.fetchConfig();
    }
  }

  getIdentifier(record) {
    const key = this.config
      ? this.config.entityUniqueKey(record.entity)
      : undefined;
    return key ? record[key] : record.bcid;
  }

  mainRecordDetails() {
    if (detailCache.main) {
      return detailCache.main;
    }
    detailCache.main = Object.keys(this.record)
      .filter(k => mainRecordDetails[this.record.entity].includes(k))
      .reduce((accumulator, key) => {
        const val = { text: this.record[key] };
        if (key === 'bcid') {
          val.href = `https://n2t.net/${this.record[key]}`;
        }

        if (key === 'bioSample') {
          accumulator.bioSamplesLink = {
            text: 'NCBI BioSamples',
            href: `https://www.ncbi.nlm.nih.gov/bioproject/${
              this.record.bioSample.bioProjectId
            }`,
          };
          accumulator.bioProjectLink = {
            text: 'NCBI BioProject',
            href: `https://www.ncbi.nlm.nih.gov/biosample?LinkName=bioproject_biosample_all&from_uid=${
              this.record.bioSample.bioProjectId
            }`,
          };
        } else {
          accumulator[key] = val;
        }
        return accumulator;
      }, {});
    return detailCache.main;
  }

  auxiliaryRecordDetails(index) {
    const numCols = this.$mdMedia('gt-sm') ? 2 : 1;

    if (detailCache[index] && detailCacheNumCols === numCols)
      return detailCache[index];

    if (detailCacheNumCols !== numCols) {
      Object.keys(detailCache).forEach(k => {
        if (k !== 'main') delete detailCache[k];
      });
      detailCacheNumCols = numCols;
    }

    const keys = Object.keys(this.record).filter(
      k =>
        !mainRecordDetails[this.record.entity].includes(k) &&
        !['bcid', 'entity'].includes(k),
    );

    let view = index === 0 ? keys : [];
    if (numCols > 1) {
      const perCol = Math.ceil(keys.length / numCols);
      const start = index * perCol;
      if (start > keys.length) view = [];
      else {
        const last = start + perCol;
        view = keys.slice(start, last > keys.length ? keys.length : last);
      }
    }
    detailCache[index] = view.reduce((accumulator, key) => {
      accumulator[key] = this.record[key];
      return accumulator;
    }, {});

    return detailCache[index];
  }

  setPhotos() {
    const photoEntities = this.config.entities
      .filter(e => e.type === 'Photo')
      .map(e => e.conceptAlias);

    this.photos = Object.keys(this.children)
      .filter(e => photoEntities.includes(e))
      .reduce((accumulator, k) => accumulator.concat(this.children[k]), [])
      .sort((a, b) => a.qualityScore > b.qualityScore)
      .map(photo => ({
        id: photo.photoID,
        title: photo.photoID,
        alt: `${photo.photoID} image`,
        thumbUrl: photo.img128,
        url: photo.img512,
        extUrl: photo.originalUrl,
      }));
  }

  setParentDetail(parent) {
    if (!parent) return;
    const detailMap = parentRecordDetails[parent.entity];
    this.parentDetail = Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, { key: detailMap[key](parent) }),
      {},
    );
  }

  setChildDetails(children) {
    if (!children) return;
    const childMap = mapChildren(children);

    const childDetails = c =>
      c.map(child => {
        const detailMap = childRecordDetails[child.entity];
        return Object.entries(detailMap).reduce(
          (accumulator, [key, fn]) =>
            Object.assign(accumulator, {
              [key]: fn(child),
            }),
          {},
        );
      });

    this.childDetails = Object.entries(childMap).reduce(
      (accumulator, [entity, value]) =>
        Object.assign(accumulator, {
          [entity]: childDetails(value),
        }),
      {},
    );
  }

  fetchConfig() {
    this.loading = true;
    // short-circuit if the config is already loaded
    if (
      this.currentProject &&
      this.currentProject.projectId === this.record.projectId
    ) {
      this.config = this.currentProject.config;
      this.loading = false;
      return;
    }

    this.ProjectConfigService.get(this.record.projectId)
      .then(config => {
        this.config = config;
        this.setPhotos();
      })
      .catch(() =>
        angular.toaster.error('Failed to fetch project configuration'),
      )
      .finally(() => {
        this.loading = false;
      });
  }
}

export default {
  template,
  controller: RecordController,
  bindings: {
    record: '<',
    currentProject: '<',
  },
};
