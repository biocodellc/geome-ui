import fimsExpedition from "../../../components/expeditions/expedition.component";

const fimsProjectExpedition = {
  template:
    '<div class="admin">
        <fims-expedition
            back-state="$ctrl.backState"
            expedition="$ctrl.expedition">
      </fims-expedition>
    </div>`,
  bindings: {
    expedition: '<',
    backState: '<',
  },
};

export default angular.module('fims.projectExpedition', [ fimsExpedition ])
  .component('fimsProjectExpedition', fimsProjectExpedition)
  .name;
