import angular from 'angular';
import config from '../utils/config';
import authService from './auth.service';

const { restRoot } = config;

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
        results.size = response.data.size;
        results.page = response.data.number;
        results.totalElements = response.data.totalElements;

        if (results.totalElements === 0) {
          angular.toaster('No results found.');
        }

        results.data = response.data.content;
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
