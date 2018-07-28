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
  Event: {},
  Sample: {
    materialSampleID: getKey('materialSampleID'),
    species: getKey('species'),
    genus: getKey('genus'),
    principalInvestigator: getKey('principalInvestigator'),
    bcid: s => ({
      text: s.bcid,
      href: `https://n2t.net/${s.bcid}`,
    }),
  },
  Tissue: {},
  fastaSequence: {
    marker: getKey('marker'),
    sequence: getKey('sequence'),
    bcid: s => ({
      text: s.bcid,
      href: `https://n2t.net/${s.bcid}`,
    }),
  },
  fastqMetadata: {
    materialSampleID: getKey('materialSampleID'),
    bioSamplesLink: m => ({
      text: m.bioSample ? 'NCBI BioSamples' : undefined,
      href: m.bioSample
        ? `https://www.ncbi.nlm.nih.gov/bioproject/${m.bioSample.bioProjectId}`
        : undefined,
    }),
    bioProjectLink: m => ({
      text: m.bioSample ? 'NCBI BioProject' : undefined,
      href: m.bioSample
        ? `https://www.ncbi.nlm.nih.gov/biosample?LinkName=bioproject_biosample_all&from_uid=${
            m.bioSample.bioProjectId
          }`
        : undefined,
    }),
    bcid: s => ({
      text: s.bcid,
      href: `https://n2t.net/${s.bcid}`,
    }),
  },
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
      this.parent = this.record.parent;
      this.children = this.record.children;
      const { projectId } = this.record;
      this.record = this.record.record;
      this.fetchConfig(projectId);
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
    const detailMap = mainRecordDetails[this.record.entity];
    detailCache.main = Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, { [key]: detailMap[key](this.record) }),
      {},
    );
    return detailCache.main;
  }

  auxiliaryRecordDetails(index) {
    const numCols = this.$mdMedia('gt-sm') ? 2 : 1;

    if (['fastaSequence', 'fastqMetadata'].includes(this.record.entity)) {
      return undefined;
    }

    if (detailCache[index] && detailCacheNumCols === numCols) {
      return detailCache[index] === {} ? undefined : detailCache[index];
    }

    if (detailCacheNumCols !== numCols) {
      Object.keys(detailCache).forEach(k => {
        if (k !== 'main') delete detailCache[k];
      });
      detailCacheNumCols = numCols;
    }

    const keys = Object.keys(this.record).filter(
      k =>
        !Object.keys(mainRecordDetails[this.record.entity]).includes(k) &&
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

    return detailCache[index] === {} ? undefined : detailCache[index];
  }

  setPhotos() {
    const photoEntities = this.config.entities
      .filter(e => e.type === 'Photo')
      .map(e => e.conceptAlias);

    if (!this.children) return;

    this.photos = this.children
      .filter(e => photoEntities.includes(e.entity))
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
        Object.assign(accumulator, { [key]: detailMap[key](parent) }),
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

  fetchConfig(projectId) {
    this.loading = true;
    // short-circuit if the config is already loaded
    if (this.currentProject && this.currentProject.projectId === projectId) {
      this.config = this.currentProject.config;
      this.loading = false;
      return;
    }

    this.ProjectConfigService.get(projectId)
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
