export default {
  template:
    `<div class="admin">
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
