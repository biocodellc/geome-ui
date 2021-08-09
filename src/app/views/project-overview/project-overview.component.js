/* eslint-disable array-callback-return */
import QueryParams from '../query/QueryParams';
/*
TODO: fetch these variables from configuration
import config from '../../utils/config';
const { localContextsAPIRoot} = config;
const { localContextsProjectRoot } = config;
*/

const template = require('./project-overview.html');

class ProjectOverviewController {
  constructor(
    $state,
    $location,
    ExpeditionService,
    DataService,
    QueryService,
    ProjectService,
  ) {
    'ngInject';

    this.$state = $state;
    this.$location = $location;
    this.ExpeditionService = ExpeditionService;
    this.DataService = DataService;
    this.QueryService = QueryService;
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.url = this.$location.absUrl().split('?')[0];
    this.templateUrl = this.url.replace('project-overview', 'template');
    this.loading = true;
    this.totalItems = null;
    this.itemsPerPage = 100;
    this.currentPage = 1;
    this.results = [];
    this.displayResults = [];
    this.menuCache = {};
  }

  $onChanges(changesObj) {
    if (
      this.currentProject &&
      'currentProject' in changesObj &&
      changesObj.currentProject.previousValue !== this.currentProject
    ) {
      this.loading = true;
      this.fetchPage();
    }
  }

  viewTeamOverview() {
    if (this.currentProject.limitedAccess) {
      this.ProjectService.all(true)
        .then(({ data }) => {
          const publicProjectWithSameConfiguration = data.find(
            p =>
              p.projectConfiguration.id ===
              this.currentProject.projectConfiguration.id,
          );
          this.ProjectService.setCurrentProject(
            publicProjectWithSameConfiguration,
          );
        })
        .finally(() => this.$state.go('team-overview'));
    } else this.$state.go('team-overview');
  }

  viewData(expeditionCode) {
    this.$state.go('query', {
      q: `_projects_:${
        this.currentProject.projectId
      } and _expeditions_:[${expeditionCode}]`,
    });
  }

  worksheetEntities() {
    return this.currentProject.config.entities
      .filter(e => !!e.worksheet)
      .sort((a, b) => {
        if (a.parentEntity) {
          if (b.parentEntity) return 0;
          return 1;
        } else if (b.parentEntity) {
          return -1;
        }
        return 0;
      })
      .map(e => e.conceptAlias);
  }

  downloadCsv(expeditionCode) {
    this.loadingExpedition = expeditionCode || 'project';

    let res;
    if (expeditionCode) {
      res = this.DataService.exportData(
        this.currentProject.projectId,
        expeditionCode,
      );
    } else {
      const entities = this.worksheetEntities();
      const conceptAlias = entities.shift();

      res = this.QueryService.downloadCsv(
        this.getQuery(expeditionCode, entities),
        conceptAlias,
      );
    }
    res.finally(() => (this.loadingExpedition = undefined));
  }

  downloadExcel(expeditionCode) {
    this.loadingExpedition = expeditionCode;

    const entities = this.worksheetEntities();
    const conceptAlias = entities.shift();

    this.QueryService.downloadExcel(
      this.getQuery(expeditionCode, entities),
      conceptAlias,
    ).finally(() => (this.loadingExpedition = undefined));
  }

  getQuery(expeditionCode, selectEntities) {
    const params = new QueryParams();
    if (expeditionCode) {
      params.expeditions.push({ expeditionCode });
    }
    params.projects.push(this.currentProject);
    return params.buildQuery(selectEntities);
  }

  downloadFastq(expeditionCode) {
    this.loadingExpedition = expeditionCode;
    this.DataService.generateSraData(
      this.currentProject.projectId,
      expeditionCode,
    ).finally(() => (this.loadingExpedition = undefined));
  }

  menuOptions(expedition) {
    if (this.currentProject.limitedAccess || this.loading === true) return;
    if (!this.menuCache[expedition.expeditionCode]) {
      // const worksheets = [];
      let foundWorksheet = false;
      this.menuCache[expedition.expeditionCode] = this.headers
        .map(header => {
          const conceptAlias = header.replace('Count', '');
          const entity = this.currentProject.config.entities.find(
            e => e.conceptAlias === conceptAlias,
          );

          // Hack to prevent errors while switching projects from a private, discoverable project to a public project
          if (!entity) return;

          // if count is 0
          if (!Number(expedition[header])) return;

          if (entity.worksheet) {
            if (foundWorksheet) return;
            foundWorksheet = true;
            // eslint-disable-next-line consistent-return
            return {
              fn: this.downloadCsv.bind(this),
              name: 'CSV Archive',
            };
          } else if (entity.type === 'Fastq') {
            // eslint-disable-next-line consistent-return
            return {
              fn: this.downloadFastq.bind(this),
              name: 'Fastq - SRA Metadata',
            };
          }
        })
        .filter(o => o !== undefined);

      if (foundWorksheet) {
        this.menuCache[expedition.expeditionCode].splice(1, 0, {
          fn: this.downloadExcel.bind(this),
          name: 'Excel Workbook',
        });
      }
    }

    return this.menuCache[expedition.expeditionCode];
  }
  // eslint-disable-next-line class-methods-use-this
  humanReadableHeader(val) {
    return val
      .replace('Count', '') // remove 'Count' suffix
      .replace(/([A-Z])/g, match => ` ${match}`) // split on camelCase
      .replace(/^./, match => match.toUpperCase()) // uppercase each word
      .trim()
      .replace(/\w$/, match =>
        match === 's' || match === 'a' ? match : `${match}s`,
      ); // end w/ 's'
  }

  pageChanged() {
    // each object in the result contains the expedition info,
    // as well as the 1 {entity}Count value for each entity
    // our table headers are these count values
    if (this.results.length !== 0) {
      this.headers = Object.keys(this.results[0]).filter(k =>
        k.endsWith('Count'),
      );
      this.displayResults = this.results.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage,
      );
    }
  }

  fetchPage() {
    this.ExpeditionService.stats(this.currentProject.projectId)
      .then(({ data }) => {
        Object.assign(this.results, data);
        this.pageChanged();
        this.totalItems = this.results.length;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}

export default {
  template,
  controller: ProjectOverviewController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};
