export default {
  template: `<div class="admin">
        <fims-expedition
            back-state="$ctrl.backState"
            current-project="$ctrl.currentProject"
            expedition="$ctrl.expedition">
      </fims-expedition>
    </div>`,
  bindings: {
    expedition: '<',
    currentProject: '<',
    backState: '<',
  },
};
