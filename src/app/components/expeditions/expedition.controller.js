export default class ExpeditionController {
  constructor(ExpeditionService, DataService, expedition, backState) {
    this.ExpeditionService = ExpeditionService;
    this.DataService = DataService;

    this.expedition = expedition;
    this.backState = backState;
    this.export = exportData;

  }

  exportData() {
    this.DataService.export(this.expedition.expeditionCode);
  }
}
