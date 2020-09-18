// TODO: change all the n2t links in the app to state.go(record)
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
      this.data = this.record.expedition;
      this.header = this.record.expedition.expeditionTitle.concat(
        ' (',
        this.record.expedition.expeditionCode,
        ')',
      );
      this.parentEntity = 'Project';
      this.prepareMainDetails(this.data);
      this.prepareParentDetails(this.data.project);
      this.prepareChildDetails(this.data.entityIdentifiers);
    } else if (this.record.entityIdentifier) {
      this.entity = 'entityIdentifier';
      this.data = this.record.entityIdentifier;
      this.header = this.record.entityIdentifier.expedition.expeditionTitle.concat(
        ' ',
        this.record.entityIdentifier.conceptAlias,
        's',
      );
      this.parentEntity = 'Expedition';
      this.prepareMainDetails(this.data);
      this.prepareParentDetails(this.data.expedition);
      this.prepareChildDetails(this.data);
    }
  }

  prepareMainDetails(main) {
    const detailMap = mainRecordDetails[this.entity];
    this.mainRecordDetails = Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, { [key]: detailMap[key](main) }),
      {},
    );
  }

  prepareParentDetails(parent) {
    const detailMap = parentRecordDetails[this.entity];
    this.parentDetail = Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, { [key]: detailMap[key](parent) }),
      {},
    );
  }

  prepareChildDetails(children) {
    const detailMap = childRecordDetails[this.entity];

    if (!Array.isArray(children)) {
      const child = children;

      this.childDetails = Object.keys(detailMap).reduce(
        (accumulator, key) =>
          Object.assign(accumulator, {
            [key]: [{ details: detailMap[key](child) }],
          }),
        {},
      );
    } else {
      const childDetails = {};
      children.forEach(ch => {
        const { conceptAlias } = ch;

        const value = Object.keys(detailMap).reduce(
          (accumulator, key) =>
            Object.assign(accumulator, { details: detailMap[key](ch) }),
          {},
        );
        const valueArray = [];
        valueArray.push(value);
        this.childDetails = Object.assign(childDetails, {
          [conceptAlias]: valueArray,
        });
      });
    }
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

  isObject(value) {
    return typeof value === 'object';
  }
}

export default {
  template,
  controller: RootRecordController,
  bindings: {
    record: '<',
  },
};
