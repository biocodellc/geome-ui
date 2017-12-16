export default class ExpeditionController {
  constructor(ExpeditionService, DataService, expedition, backState) {
    this.ExpeditionService = ExpeditionService;
    this.DataService = DataService;

    this.expedition = expedition;
    this.backState = backState;
  }

  exportData() {
    this.DataService.exportData(this.expedition.expeditionCode);
  }
}
