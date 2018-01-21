class ExpeditionController {
  new(val) {
    const set = () => {
      delete this.expeditionCode;
      this.onNewExpeditionChange({ newExpedition: val });
      return true;
    };

    return arguments.length ? set() : this.newExpedition;
  }
}

export default {
  template: require('./uploadExpedition.html'),
  controller: ExpeditionController,
  bindings: {
    newExpedition: '<',
    userExpeditions: '<',
    onNewExpeditionChange: '&',
    onChange: '&',
  },
};