import angular from 'angular';
import compareValues from '../../utils/compareValues';
import {
  mainRecordDetails,
  childRecordDetails,
  parentRecordDetails,
} from './recordDetails';

const template = require('./record.html');

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
    if (!detailMap) return undefined;

    detailCache.main = Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, { [key]: detailMap[key](this.record) }),
      {},
    );
    return detailCache.main;
  }

  auxiliaryRecordDetails(index) {
    if (this.loading) return undefined;

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

    const e = this.config.entities.find(
      entity => entity.conceptAlias === this.record.entity,
    );

    const recordKeys = Object.keys(this.record).filter(
      k =>
        (!mainRecordDetails[this.record.entity] ||
          !Object.keys(mainRecordDetails[this.record.entity]).includes(k)) &&
        !['bcid', 'entity', 'expeditionCode', 'projectId'].includes(k),
    );

    const sortedKeys = e.attributes.reduce((accumulator, attribute) => {
      if (recordKeys.includes(attribute.column)) {
        accumulator.push(attribute.column);
      }
      return accumulator;
    }, []);

    // add any missing keys to the sortedKeys list
    recordKeys
      .sort()
      .forEach(k => !sortedKeys.includes(k) && sortedKeys.push(k));

    let view = index === 0 ? sortedKeys : [];
    if (numCols > 1) {
      const perCol = Math.ceil(sortedKeys.length / numCols);
      const start = index * perCol;
      if (start > sortedKeys.length) view = [];
      else {
        const last = start + perCol;
        view = sortedKeys.slice(
          start,
          last > sortedKeys.length ? sortedKeys.length : last,
        );
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

    const photos = this.children.filter(e => photoEntities.includes(e.entity));
    const hasQualityScore = photos.some(p => p.qualityScore);

    this.photos = photos
      .sort(
        (a, b) =>
          hasQualityScore
            ? a.qualityScore > b.qualityScore
            : a.photoID > b.photoID,
      )
      .map(photo => ({
        id: photo.photoID,
        title: photo.photoID,
        alt: `${photo.photoID} image`,
        bubbleUrl: photo.img64,
        url: photo.img1024,
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
        this.sortChildren();
      })
      .catch(() =>
        angular.toaster.error('Failed to fetch project configuration'),
      )
      .finally(() => {
        this.loading = false;
      });
  }

  sortChildren() {
    if (!this.childDetails) return;

    Object.keys(this.childDetails).forEach(conceptAlias => {
      const e = this.config.entities.find(
        entity => entity.conceptAlias === conceptAlias,
      );
      this.childDetails[conceptAlias] = this.childDetails[conceptAlias].sort(
        compareValues(`${e.uniqueKey}.text`),
      );
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
