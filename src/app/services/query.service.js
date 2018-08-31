import angular from 'angular';
import config from '../utils/config';
import authService from './auth.service';

const { restRoot } = config;

function transformResults(data) {
  const records = [];

  if (data.Sample) {
    data.Sample.forEach(s => {
      const record = s;
      record.event = data.Event.find(e => e.eventID === s.eventID);
      records.push(record);
    });
  } else if (data.Event) {
    data.Event.forEach(e => {
      records.push({ event: e });
    });
  }

  return records;
}

class QueryService {
  constructor($http, $window, FileService) {
    'ngInject';

    this.$http = $http;
    this.$window = $window;
    this.FileService = FileService;
  }

  queryJson(query, entity, page, limit) {
    return this.$http({
      method: 'GET',
      url: `${restRoot}records/${entity}/json?limit=${limit}&page=${page}`,
      params: query,
      keepJson: true,
    }).then(response => {
      const results = {
        page: 0,
        size: 0,
        totalElements: 0,
        data: [],
      };

      if (response.data) {
        results.data = transformResults(response.data.content);

        results.page = response.data.page;
        results.totalElements = results.data.length;

        if (results.data.length === 0) {
          angular.toaster('No results found.');
        }

        // TODO: Remove this, and implement dynamic loading. Set limit to 1000
        // and if 1k results are returned, ask the user if they want to load more.
        if (results.totalElements === limit) {
          angular.toaster(
            'Query results are limited to 10,000. Either narrow your search or download the results to view everything.',
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
