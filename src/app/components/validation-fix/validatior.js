(function () {
    'use strict';

    angular.module('fims.validation')
        .factory('Validator', Validator);

    Validator.$inject = ['Upload', 'REST_ROOT'];

    function Validator(Upload, REST_ROOT) {

        function Validator(projectId, expeditionCode) {
            this._projectId = projectId;
            this._expeditionCode = expeditionCode;
            this._forUpload = false;
            this._isPublic = undefined;
            this._workbooks = [];
            this._dataSourceMetadata = [];
            this._dataSourceFiles = [];
        }

        Validator.prototype = {

            forUpload: function(upload) {
                this._forUpload = upload;
                return this;
            },

            isPublic: function (isPublic) {
                this._isPublic = isPublic;
                return this;
            },

            workbook: function (workbookFiles) {
                this._workbooks = this._workbooks.concat(workbookFiles);
                return this;
            },

            dataSource: function(file) {
                // TODO assuming that project only has 1 entity for now
                this._dataSourceMetadata.push({
                    dataType: "TABULAR",
                    filename: file.name,
                    sheetName: this.project.projectConfig.entities[0].worksheet
                });

                this._dataSourceFiles.push(file);
                return this;
            },
            
            validate: function() {
                return Upload.upload({
                    url: REST_ROOT + "data/validate",
                    data:  {
                        projectId: this._projectId,
                        expeditionCode: this._expeditionCode,
                        upload: this._forUpload,
                        public: this._isPublic,
                        workbooks: this._workbooks,
                        dataSourceMetadata: this._dataSourceMetadata,
                        dataSourceFiles: this._dataSourceFiles
                    },
                    arrayKey: ''
                })
                
            }

        };

        return Validator;
    }

})();