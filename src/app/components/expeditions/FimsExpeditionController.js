import QueryParams from '../../views/query/QueryParams';

const template = require('./delete-confirmation.tpl.html');

class DeleteConfirmationController {
  constructor($uibModalInstance, expeditionCode) {
    'ngInject';

    this.expeditionCode = expeditionCode;
    this.delete = $uibModalInstance.close;
    this.cancel = $uibModalInstance.dismiss;
  }
}

export default class FimsExpeditionController {
  constructor($state, $uibModal, ExpeditionService, DataService, QueryService) {
    'ngInject';

    this.$state = $state;
    this.$uibModal = $uibModal;
    this.ExpeditionService = ExpeditionService;
    this.DataService = DataService;
    this.QueryService = QueryService;

    this.hasFastq = false;
  }

  $onChanges(changesObj) {
    if (
      this.expedition &&
      this.currentProject &&
      ('expedition' in changesObj || 'currentProject' in changesObj)
    ) {
      this.ExpeditionService.stats(
        this.currentProject.projectId,
        this.expedition.expeditionCode,
      ).then(({ data }) => {
        if (data && data.length > 0) {
          this.hasFastq = data[0].fastqMetadataCount > 0;
        }
      });
    }
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

  downloadCsv() {
    this.loading = true;

    this.DataService.exportData(
      this.currentProject.projectId,
      this.expedition.expeditionCode,
    ).finally(() => (this.loading = false));
  }

  downloadExcel() {
    this.loading = true;

    const entities = this.worksheetEntities();
    const conceptAlias = entities.shift();

    this.QueryService.downloadExcel(
      this.getQuery(entities),
      conceptAlias,
    ).finally(() => (this.loading = false));
  }

  getQuery(selectEntities) {
    const params = new QueryParams();
    params.expeditions.push({ expeditionCode: this.expedition.expeditionCode });
    params.projects.push(this.currentProject);
    return params.buildQuery(selectEntities);
  }

  downloadFastq() {
    this.loading = true;
    this.DataService.generateSraData(
      this.currentProject.projectId,
      this.expedition.expeditionCode,
    ).finally(() => (this.loading = false));
  }

  deleteExpedition(projectId, expedition) {
    const modal = this.$uibModal.open({
      template,
      size: 'md',
      controller: DeleteConfirmationController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: 'static',
      resolve: {
        expeditionCode: () => expedition.expeditionCode,
      },
    });

    return modal.result.then(() =>
      this.ExpeditionService.delete(projectId, expedition),
    );
  }
}
