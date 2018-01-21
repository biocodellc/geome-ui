class ResultMessagesController {
  $onInit() {
    this.isOpen = false;
    this.type = (this.error) ? "Error" : "Warning";
    this.class = (this.error) ? "Error" : "Warning";
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
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
