const template = require('./query-photo.html');

const TABLE_COLUMNS = {
  Event: [
    'eventID',
    'locality',
    'decimalLatitude',
    'decimalLongitude',
    'yearCollected',
    'expeditionCode',
    // 'projectCode',
    'bcid',
  ],
  Sample: [
    'materialSampleID',
    'eventID',
    'locality',
    'decimalLatitude',
    'decimalLongitude',
    'yearCollected',
    'phylum',
    'scientificName',
    'expeditionCode',
    'bcid',
  ],
  Event_Photo: [
    'img128',
    'photoID',
    'eventID',
    'qualityScore',
    'photographer',
    'expeditionCode',
    'bcid',
  ],
  Diagnostics: [
    'scientificName',
    'materialSampleID',
    'measurementType',
    'measurementValue',
    'measurementUnit',
    'diseaseTested',
    'diseaseDetected',
    'expeditionCode',
    'bcid',
  ],
  Sample_Photo: [
    'img128',
    'photoID',
    'materialSampleID',
    'qualityScore',
    'photographer',
    'expeditionCode',
    'bcid',
  ],
  Tissue: [
    'tissueID',
    'materialSampleID',
    'yearCollected',
    'scientificName',
    'tissueType',
    'tissuePlate',
    'tissueWell',
    'expeditionCode',
    'bcid',
  ],
  fastqMetadata: [
    {
      column: 'BioSample Accession #',
      get: f => (f.bioSample ? f.bioSample.accession : 'N/A'),
    },
    'tissueID',
    'materialSampleID',
    'yearCollected',
    'scientificName',
    'libraryLayout',
    'librarySource',
    'librarySelection',
    'expeditionCode',
    'bcid',
  ],
};

class QueryPhotoController {
  constructor($window, $state) {
    'ngInject';

    this.$window = $window;
    this.$state = $state;
  }

  $onInit() {
    this.tableColumns = TABLE_COLUMNS.Sample;
    this.tableData = [];
    this.currentPage = 1;
    this.pageSize = 50;
    this.limitOptions = [25, 50, 100];
    this.sampleBcid = ""
  }

  getTableColumns() {
    if (this.tableColumns) {
      return this.tableColumns.map(column =>
        typeof column === 'string' ? column : column.column,
      );
    }
    return [];
  }

  getVal(record, column) {
    return typeof column === 'string' ? record[column] : column.get(record);
  }

  $onChanges(changesObj) {
    if ('results' in changesObj) {
      this.currentPage = 1;
    }
    if ('entity' in changesObj) {
      this.tableColumns = TABLE_COLUMNS[this.entity];
    }
  }

  detailView(resource) {
    this.$window.open(
      this.$state.href('record', {
        bcid: resource.bcid,
      }),
    );
  }

  sampleDetailViewByGroup(group) {
    this.sampleBcid = group[0].sampleBcid;
    this.$window.open(
      this.$state.href('record', {
        bcid: this.sampleBcid,
      }),
    );
  }
  eventDetailViewByGroup(group) {  
    this.eventBcid = group[0].eventBcid;
    this.$window.open(
      this.$state.href('record', {
        bcid: this.eventBcid,
      }),
    );
  }
  getHighestQualityPhoto = function (group) {
    if (group && group.length > 0) {
      // Find the photo with the highest quality_score
      var highestQualityPhoto = group.reduce(function (prev, current) {
        return (prev.quality_score || 0) > (current.quality_score || 0) ? prev : current;
      });
      return highestQualityPhoto.img128;
    }
    return ''; // Return an empty string if the group is empty or undefined
  };

  countGroups = function () {
    data = this.results.data;

    if (!Array.isArray(data)) {
      return 0;
    }

    // Use an object to keep track of the unique groups
    var groupCounts = {};

    // Iterate through the input array and count the groups
    data.forEach(function (item) {
      var group = item.group; // Replace 'group' with the actual property used in your groupBy filter
      if (!groupCounts[group]) {
        groupCounts[group] = true;
      }
    });

    // Return the count of unique groups
    return Object.keys(groupCounts).length;
  };


}

export default {
  template,
  controller: QueryPhotoController,
  bindings: {
    results: '<',
    entity: '<',
  },
};
