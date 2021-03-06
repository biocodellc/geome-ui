import {
  mainRecordDetails,
  childRecordDetails,
  parentRecordDetails,
} from '../recordDetails';

const template = require('./root-record.html');

class RootRecordController {
  constructor($state) {
    'ngInject';

    this.$state = $state;
  }

  $onInit() {
    if (this.record.expedition) {
      this.entity = 'expedition';
      this.parentEntity = 'Project';
      this.data = this.record.expedition;
      this.parent = this.data.project;
      this.childData = this.data.entityIdentifiers;
      this.header = this.data.expeditionTitle.concat(
        ' (',
        this.data.expeditionCode,
        ')',
      );
    } else if (this.record.entityIdentifier) {
      this.entity = 'entityIdentifier';
      this.parentEntity = 'Expedition';
      this.data = this.record.entityIdentifier;
      this.parent = this.data.expedition;
      this.childData = this.data;
      const plural = this.data.conceptAlias.endsWith('s') ? ' ' : 's';
      this.header = this.data.expedition.expeditionTitle.concat(
        ' ',
        this.data.conceptAlias,
        plural,
      );
    }
    this.prepareChildDetails(this.childData);
    this.prepareParentDetails(this.parent);
    this.prepareMainDetails(this.data);
  }

  prepareMainDetails(data) {
    const detailMap = mainRecordDetails[this.entity];
    this.mainRecordDetails = this.makeDetailObject(data, detailMap);
  }

  prepareParentDetails(parent) {
    const detailMap = parentRecordDetails[this.entity];
    this.parentDetail = this.makeDetailObject(parent, detailMap);
  }

  prepareChildDetails(children) {
    const detailMap = childRecordDetails[this.entity];

    if (Array.isArray(children)) {
      const childDetails = {};
      children.forEach(ch => {
        const { conceptAlias } = ch;
        const value = Object.keys(detailMap).reduce(
          (accumulator, key) => Object.assign(accumulator, detailMap[key](ch)),
          {},
        );
        this.childDetails = Object.assign(childDetails, {
          [conceptAlias]: value,
        });
      });
    } else {
      this.childDetails = this.makeDetailObject(children, detailMap);
    }
  }

  makeDetailObject(data, detailMap) {
    return Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, { [key]: detailMap[key](data) }),
      {},
    );
  }

  query(href) {
    if (
      href === 'query' &&
      this.record.entityIdentifier.conceptAlias !== 'Sample_Photo' &&
      this.record.entityIdentifier.conceptAlias !== 'Event_Photo'
    ) {
      this.$state.go('query', {
        q: `_expeditions_:[${
          this.record.entityIdentifier.expedition.expeditionCode
        }]`,
        entity: `${this.record.entityIdentifier.conceptAlias}`,
      });
    } else this.$state.go(href);
  }
}

export default {
  template,
  controller: RootRecordController,
  bindings: {
    record: '<',
  },
};
