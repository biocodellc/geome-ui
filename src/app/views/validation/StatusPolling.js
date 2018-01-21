import { EventEmitter } from 'events';

export default class StatusPolling extends EventEmitter {
  constructor($http, REST_ROOT) {
    super();
    this.$http = $http;
    this.REST_ROOT = REST_ROOT;

    this.errorCnt = 0;
    this.poll = false;
  }

  startPolling() {
    this.poll = true;
    // give a chance for upload to start
    setTimeout(this.pollStatus, 500)
  }

  stopPolling() {
    this.poll = false;
    this.errorCnt = 0;
    clearTimeout(this.pollingTimeoutId);
  }

  /*
      Poll the server to get updates on the validation progress
      We will retry 5 times if there is an error. This is because the status api is called before the
      processController has been stored in the session. If the status api doesn't detect a processController,
      it returns an error.
  */
  pollStatus() {
    // check if UploadisInProgress in case the user is uploading a large file or has a slow connection.
    //TODO fix this
    if (this.errorCnt >= 5) {// && !Upload.isUploadInProgress()) {
      this.stopPolling();
      return;
    }


    this.$http.get(this.REST_ROOT + 'validate/status')
      .then(({ data }) => {
          //TODO fix this
          if (data.error && this.errorCnt >= 4) {// && !ResultsDataFactory.validationMessages) {
            this.emit('error', data.error);
            this.errorCnt++;
          } else if (data.error) {
            this.errorCnt++;
          } else {
            this.emit('status', data.status);
            this.errorCnt = 0;
          }

          // wait 1 second before polling again
          if (this.poll) {
            this.pollingTimeoutId = setTimeout(this.pollStatus, 1000);
          }
        },
      )
  }
}

