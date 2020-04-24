import angular from 'angular';

import RecordMap from './RecordMap';

import compareValues from '../../utils/compareValues';
import flatten from '../../utils/flatten';
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

let detailCache = {};
let detailCacheNumCols;
class RecordController {
  constructor($mdMedia, ProjectService) {
    'ngInject';

    this.$mdMedia = $mdMedia;
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.loading = true;
    this.inlineGallery = true;
  }

  $onChanges(changesObj) {
    if ('record' in changesObj && this.record) {
      detailCache = {};
      detailCacheNumCols = undefined;
      this.setParentDetail(this.record.parent);
      this.setChildDetails(this.record.children);
      this.parent = this.record.parent;
      this.children = this.record.children;
      const { projectId } = this.record;
      this.record = this.record.record;
      this.fetchProject(projectId);
      if (this.record.entity === 'Event') this.prepareMap();
    }
  }

  prepareMap() {
    const data = [this.record];
    this.map = new RecordMap('decimalLatitude', 'decimalLongitude');
    this.map.on(RecordMap.INIT_EVENT, () => this.map.setMarkers(data));
  }

  getIdentifier(record) {
    const key = this.project
      ? this.project.config.entityUniqueKey(record.entity)
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

    if (detailCache[index] && detailCacheNumCols === numCols) {
      return detailCache[index] === {} ? undefined : detailCache[index];
    }

    if (detailCacheNumCols !== numCols) {
      Object.keys(detailCache).forEach(k => {
        if (k !== 'main') delete detailCache[k];
      });
      detailCacheNumCols = numCols;
    }

    const e = this.project.config.entities.find(
      entity => entity.conceptAlias === this.record.entity,
    );
    const flatRecord = flatten(this.record);

    const recordKeys = Object.keys(flatRecord).filter(
      k =>
        (!mainRecordDetails[this.record.entity] ||
          !Object.keys(mainRecordDetails[this.record.entity]).includes(k)) &&
        !['bcid', 'entity', 'bulkLoadFile'].includes(k),
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
      if (key === 'projectId') {
        accumulator.project = {
          text: this.project.projectTitle,
          href: `/workbench/overview?projectId=${this.project.projectId}`,
        };
      } else if (key === 'expeditionCode') {
        accumulator[key] = {
          text: flatRecord[key],
          href: `/query?q=_projects_:${
            this.project.projectId
          } and _expeditions_:${flatRecord[key]}`,
        };
      } else if (['img128', 'img512', 'img1024'].includes(key)) {
        accumulator[key] = {
          text: `${key.substring(3)} pixel wide image`,
          href: flatRecord[key],
        };
      } else {
        accumulator[key] = flatRecord[key];
      }

      if (key === 'imageProcessingErrors') {
        this.invalidPhoto = true;
      }

      return accumulator;
    }, {});

    return detailCache[index] === {} ? undefined : detailCache[index];
  }

  setPhotos() {
    const photoEntities = this.project.config.entities
      .filter(e => e.type === 'Photo')
      .map(e => e.conceptAlias);

    if (!this.children) return;

    const photos = this.children.filter(
      e => photoEntities.includes(e.entity) && e.processed === 'true',
    );
    const hasQualityScore = photos.some(p => p.qualityScore);

    this.photos = photos
      .sort((a, b) =>
        hasQualityScore
          ? a.qualityScore > b.qualityScore
          : a.photoID > b.photoID,
      )
      .map(photo => ({
        id: photo.photoID,
        title: photo.photoID,
        alt: `${photo.photoID} image`,
        bubbleUrl: photo.img128,
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
        if (!detailMap) return {};
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

  fetchProject(projectId) {
    this.loading = true;
    // short-circuit if the project is already loaded
    if (this.currentProject && this.currentProject.projectId === projectId) {
      this.project = this.currentProject;
      this.loading = false;
      return;
    }

    this.ProjectService.get(projectId)
      .then(project => {
        this.project = project;
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
      const e = this.project.config.entities.find(
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
    layout: '@',
    record: '<',
  },
};
