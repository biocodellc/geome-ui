class ResultMessagesController {
  $onInit() {
    this.type = (this.error) ? "Error" : "Warning";
    this.class = (this.error) ? "Error" : "Warning";
  }
}

export default {
  template: require('./validationMessages.html'),
  controller: ResultMessagesController,
  bindings: {
    error: '<',
    messages: '<',
  },
};
