(function () {
  'use strict';

  angular.module('fims.validation')
    .controller('ValidationController', ValidationController);

  function ValidationController($scope, $q, $http, $uibModal, Validator, ExpeditionService, FailModalFactory, ResultsDataFactory, ProjectFactory, StatusPollingFactory, NAAN, MAPBOX_TOKEN) {
    'ngInject';
    var modalInstance = null;
    var vm = this;

    vm.fimsMetadata = undefined;
    vm.project = undefined;
    vm.expedition = undefined;
    vm.expeditions = [];
    vm.newExpedition = false;

    vm.showProject = false;
    vm.displayResults = false;
    vm.activeTab = 0;

    vm.fimsMetadataChange = fimsMetadataChange;
    vm.resetExpedition = resetExpedition;
    vm.validate = validate;
    vm.upload = upload;

    init();

    function init() {
      fimsBrowserCheck($('#warning'));
      resetExpedition();

      $scope.$watch('vm.project', function (newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          getExpeditions();
          generateMap('map', vm.project.projectId, vm.fimsMetadata, MAPBOX_TOKEN)
            .always(function () {
              // this is a hack since we are using jQuery for generateMap
              $scope.$apply();
            });
        }
      });

      $scope.$on("resultsModalContinueUploadEvent", function () {
        continueUpload();
        ResultsDataFactory.processing = true;
      });
    }

    function fimsMetadataChange() {
      // Clear the results
      ResultsDataFactory.reset();

      // Check NAAN
      parseSpreadsheet("~naan=[0-9]+~", "Instructions").then(
        function (spreadsheetNaan) {
          if (spreadsheetNaan > 0) {
            checkNAAN(spreadsheetNaan);
          }
        });

      parseSpreadsheet("~project_id=[0-9]+~", "Instructions").then(
        function (projectId) {
          if (projectId) {
            ProjectFactory.get(projectId)
              .then(function (project) {
                vm.project = project;
              })
          }
          vm.showProject = true;
        });
    }

    function resetExpedition() {
      vm.expedition = {
        expeditionCode: undefined,
        public: false,
      };
    }

    function validate() {
      validateSubmit(false).then(
        function (response) {
          ResultsDataFactory.validationResponse = response.data;
          modalInstance.close();
        },
      );
    }

    function upload() {
      $scope.$broadcast('show-errors-check-validity');

      if (vm.newExpedition) {
        checkExpeditionExists()
          .finally(function () {
            if (vm.uploadForm.$invalid) {
              return;
            }

            submitUpload();
          });
      } else {
        if (vm.uploadForm.$invalid) {
          return;
        }
        submitUpload();
      }

    }

    function validateSubmit(forUpload) {
      ResultsDataFactory.reset();

      var validator = new Validator(vm.project.projectId, vm.expedition.expeditionCode)
        .isPublic(vm.expedition.public)
        .forUpload(forUpload);

      var splitFileName = vm.fimsMetadata.name.split('.');

      if ([ 'xls', 'xlsx' ].indexOf(splitFileName[ splitFileName.length - 1 ]) > -1) {
        validator.workbook(vm.fimsMetadata);
      } else {
        validator.dataSource(vm.fimsMetadata);
      }

      // start polling here, since firefox support for progress events doesn't seem to be very good
      StatusPollingFactory.startPolling();
      openResultsModal();

      return validator.validate().then(
        function (response) {
          return response;
        },
        function (response) {
          ResultsDataFactory.error = response.data.usrMessage || "Server Error!";
          return response;
        },
      ).finally(function () {
        StatusPollingFactory.stopPolling();
        ResultsDataFactory.processing = false;
      });

    }

    function submitUpload() {

      validateSubmit(true).then(
        function (response) {
          var validationResponse = response.data;
          ResultsDataFactory.validationResponse = validationResponse;

          if (validationResponse.valid) {
            continueUpload();
          } else if (validationResponse.hasError) {
            ResultsDataFactory.processing = false;
          }
        });
    }

    function continueUpload() {
      StatusPollingFactory.startPolling();
      return $http.put(ResultsDataFactory.validationResponse.uploadUrl + "?createExpedition=" + vm.newExpedition).then(
        function (response) {
          ResultsDataFactory.processing = false;
          if (!response.data.success) {
            ResultsDataFactory.error = response.data.message;
          } else {
            ResultsDataFactory.uploadMessage = response.data.message;
            modalInstance.close();
            resetForm();
          }

        }, function (response) {
          ResultsDataFactory.reset();
          ResultsDataFactory.error = response.data.error || response.data.usrMessage || "Server Error!";
        })
        .finally(
          function () {
            if (vm.newExpedition) {
              getExpeditions();
            }
            StatusPollingFactory.stopPolling();
          },
        );
    }

    function openResultsModal() {
      modalInstance = $uibModal.open({
        templateUrl: 'app/components/validation/results/resultsModal.tpl.html',
        size: 'md',
        controller: 'ResultsModalCtrl',
        controllerAs: 'vm',
        windowClass: 'app-modal-window',
        backdrop: 'static',
      });

      modalInstance.result
        .finally(function () {
          vm.displayResults = true;
          if (!ResultsDataFactory.error) {
            vm.activeTab = 2; // index 2 is the results tab
          }
        });
    }

    function resetForm() {
      vm.fimsMetadata = null;
      resetExpedition();
      $scope.$broadcast('show-errors-reset');
    }

    function parseSpreadsheet(regExpression, sheetName) {
      var deferred = new $q.defer();
      try {
        var f = new FileReader();
      } catch (err) {
        deferred.resolve(null);
        return deferred.promise;
      }
      // older browsers don't have a FileReader
      if (f !== null) {

        var splitFileName = vm.fimsMetadata.name.split('.');
        if (XLSXReader.exts.indexOf(splitFileName[ splitFileName.length - 1 ]) > -1) {
          $q.when(XLSXReader.utils.findCell(vm.fimsMetadata, regExpression, sheetName)).then(function (match) {
            if (match) {
              deferred.resolve(match.toString().split('=')[ 1 ].slice(0, -1));
            } else {
              deferred.resolve(null);
            }
          });
          return deferred.promise;
        }
      }
      setTimeout(function () {
        deferred.resolve(null)
      }, 100);
      return deferred.promise;

    }

    // function to verify naan's
    function checkNAAN(spreadsheetNaan) {
      if (spreadsheetNaan !== NAAN) {
        var buttons = {
          "Ok": function () {
            $("#dialogContainer").removeClass("error");
            $(this).dialog("close");
          },
        };
        var message = "Spreadsheet appears to have been created using a different FIMS/BCID system.<br>";
        message += "Spreadsheet says NAAN = " + spreadsheetNaan + "<br>";
        message += "System says NAAN = " + naan + "<br>";
        message += "Proceed only if you are SURE that this spreadsheet is being called.<br>";
        message += "Otherwise, re-load the proper FIMS system or re-generate your spreadsheet template.";

        dialog(message, "NAAN check", buttons);
      }
    }

    function checkExpeditionExists() {
      return ExpeditionService.getExpedition(vm.project.projectId, vm.expedition.expeditionCode)
        .then(function (response) {
          // if we get an expedition, then it already exists
          if (response.data) {
            vm.uploadForm.newExpeditionCode.$setValidity("exists", false);
          } else {
            vm.uploadForm.newExpeditionCode.$setValidity("exists", true);
          }
        });
    }

    function getExpeditions() {
      vm.expeditions = [];
      ExpeditionService.getExpeditionsForUser(vm.project.projectId, true)
        .then(function (response) {
          vm.expeditions = response.data;
          vm.newExpedition = vm.expeditions.length === 0;
        }, function (response) {
          FailModalFactory.open("Failed to load projects", response.data.usrMessage);
        })
    }

  }

})();
