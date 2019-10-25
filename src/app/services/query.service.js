import angular from 'angular';
import config from '../utils/config';
import authService from './auth.service';

const { restRoot } = config;

function transformResults(data, entity) {
  const records = [];

  if (Object.keys(data).length === 0) return records;

  const getRecords = (alias, uniqueKey) =>
    data[alias]
      ? data[alias].reduce((accumulator, record) => {
          accumulator[record[uniqueKey]] = record;
          return accumulator;
        }, {})
      : undefined;

  // TODO come up w/ a more generic way to flatten these records
  if (entity === 'fastqMetadata') {
    const events = getRecords('Event', 'eventID');
    const samples = getRecords('Sample', 'materialSampleID');
    const tissues = getRecords('Tissue', 'tissueID');
    data.fastqMetadata.forEach(f => {
      const record = f;
      const { bcid } = f;
      if (tissues) {
        const tissue = tissues[f.tissueID];
        const { bcid: tissueBcid } = tissue;

        let event = {};
        let sample = {};
        let eventBcid;
        let sampleBcid;

        if (samples) {
          sample = samples[tissue.materialSampleID];
          sampleBcid = sample.bcid;
        }
        if (events) {
          event = events[sample.eventID];
          eventBcid = event.bcid;
        }
        Object.assign(record, tissue, sample, event, {
          bcid,
          tissueBcid,
          sampleBcid,
          eventBcid,
        });
      }
      records.push(record);
    });
  } else if (entity === 'Tissue') {
    const events = getRecords('Event', 'eventID');
    const samples = getRecords('Sample', 'materialSampleID');
    data.Tissue.forEach(t => {
      const record = t;
      const { bcid } = t;
      if (samples) {
        const sample = samples[t.materialSampleID];
        const { bcid: sampleBcid } = sample;
        Object.assign(record, sample, { bcid, sampleBcid });

        let event = {};
        let eventBcid;

        if (events) {
          event = events[record.eventID];
          eventBcid = event.bcid;
        }
        Object.assign(record, sample, event, { bcid, sampleBcid, eventBcid });
      }
      records.push(record);
    });
  } else if (entity === 'Sample') {
    const events = getRecords('Event', 'eventID');
    data.Sample.forEach(s => {
      const record = s;
      const { bcid } = s;
      if (events) {
        const event = events[s.eventID];
        const { bcid: eventBcid } = event;
        Object.assign(record, event, { bcid, eventBcid });
        // record.event = events[s.eventID];
      }
      records.push(record);
    });
  } else if (entity === 'Event') {
    data.Event.forEach(e => {
      records.push(e);
    });
  }

  return records;
}

class QueryService {
  constructor($cacheFactory, $http, $window, FileService) {
    'ngInject';

    this.JSON_QUERY_CACHE = $cacheFactory('json_query');

    this.$http = $http;
    this.$window = $window;
    this.FileService = FileService;
  }

  queryJson(query, entity, page, limit, warnOnLimit = true) {
    return this.$http({
      method: 'GET',
      url: `${restRoot}records/${entity}/json?limit=${limit}&page=${page}`,
      params: query,
      cache: this.JSON_QUERY_CACHE,
      keepJson: true,
    }).then(response => {
      const results = {
        page: 0,
        size: 0,
        totalElements: 0,
        data: [],
      };

      if (response.data) {
        results.data = transformResults(response.data.content, entity);

        results.page = response.data.page;
        results.totalElements = results.data.length;

        if (results.data.length === 0) {
          angular.toaster('No results found.');
        }

        // TODO: Remove this, and implement dynamic loading. Set limit to 1000
        // and if 1k results are returned, ask the user if they want to load more.
        if (warnOnLimit && results.totalElements === limit) {
          angular.toaster(
            `Query results are limited to ${limit}. Either narrow your search or download the results to view everything.`,
          );
        }
      }

      return results;
    });
  }

  downloadExcel(query, entity) {
    return this.download('excel', query, entity);
  }

  downloadKml(query, entity) {
    return this.download('kml', query, entity);
  }

  downloadCsv(query, entity) {
    return this.download('csv', query, entity);
  }

  downloadFasta(query, entity) {
    return this.download('fasta', query, entity);
  }

  downloadFastq(query, entity) {
    return this.download('fastq', query, entity);
  }

  download(path, query, entity) {
    return this.$http({
      method: 'GET',
      url: `${restRoot}records/${entity}/${path}`,
      params: query,
      keepJson: true,
    })
      .then(response => {
        if (response.status === 204) {
          angular.toaster('No results found.');
          return;
        }

        this.FileService.download(response.data.url);
      })
      .catch(angular.catcher('Failed downloading file!'));
  }
}

export default angular
  .module('fims.QueryService', [authService])
  .service('QueryService', QueryService).name;
