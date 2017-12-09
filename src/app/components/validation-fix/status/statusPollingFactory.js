angular.module('fims.validation')

    .factory('StatusPollingFactory', ['$http', '$timeout', 'Upload', 'ResultsDataFactory', 'REST_ROOT',
        function ($http, $timeout, Upload, ResultsDataFactory, REST_ROOT) {
            var errorCnt = 0;
            var poll = false;
            var polling;

            var statusPollingFactory = {
                startPolling: startPolling,
                stopPolling: stopPolling
            };

            return statusPollingFactory;

            function startPolling() {
                poll = true;
                // give a chance for upload to start
                $timeout(pollStatus, 500);
            }

            function stopPolling() {
                poll = false;
                errorCnt = 0;
                $timeout.cancel(polling);
            }

            /*
             Poll the server to get updates on the validation progress
             We will retry 5 times if there is an error. This is because the status api is called before the
             processController has been stored in the session. If the status api doesn't detect a processController,
             it returns an error.
             */
            function pollStatus() {
                // check if UploadisInProgress in case the user is uploading a large file or has a slow connection.
                if (errorCnt >= 5 && !Upload.isUploadInProgress()) {
                    return stopPolling();
                }
                ResultsDataFactory.showStatus = true;
                $http.get(REST_ROOT + 'data/status').then(
                    function (response) {
                        if (response.data.error && errorCnt >= 4 && !ResultsDataFactory.validationMessages) {
                            ResultsDataFactory.error = response.data.error;
                            errorCnt++;
                            ResultsDataFactory.showOkButton = true;
                        } else if (response.data.error) {
                            errorCnt++;
                        } else {
                            ResultsDataFactory.status = response.data.status;
                            ResultsDataFactory.error = null;
                            errorCnt = 0;
                        }

                        // wait 1 second before polling again
                        if (poll) {
                            polling = $timeout(pollStatus, 1000);
                        }
                    }
                )
            }
        }]);

