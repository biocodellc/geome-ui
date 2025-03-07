import angular from 'angular';

import RecordMap from './RecordMap';

import compareValues from '../../utils/compareValues';
import flatten from '../../utils/flatten';
import {
  mainRecordDetails,
  childRecordDetails,
  parentRecordDetails,
} from './recordDetails';

const template = require('./record.html');

const mapChildren = children =>
  children.reduce((accumulator, child) => {
    if (!accumulator[child.entity]) accumulator[child.entity] = [];
    accumulator[child.entity].push(child);
    return accumulator;
  }, {});

let detailCache = {};
let detailCacheNumCols;
let localContextsPresent;

class RecordController {
  constructor($scope, $mdMedia, ProjectService, ExpeditionService, $timeout, $http, $mdDialog) {
    'ngInject';
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$http = $http;
    this.$mdMedia = $mdMedia;
    this.$timeout = $timeout;
    this.ExpeditionService = ExpeditionService;
    this.ProjectService = ProjectService;
  }

  $onChanges(changesObj) {
    if ('record' in changesObj && this.record) {
      this.loading = true;
      this.inlineGallery = true;
      detailCache = {};
      detailCacheNumCols = undefined;
      if (this.record.expedition || this.record.entityIdentifier) {
        this.loading = false;
        this.rootRecord = true;
        return;
      }
      this.setParentDetail(this.record.parent);
      this.setChildDetails(this.record.children);
      this.parent = this.record.parent;
      this.children = this.record.children;
      const {projectId} = this.record;
      this.record = this.record.record;
      this.fetchProject(projectId);
      if (this.record.entity === 'Event') this.prepareMap();
      if (this.record.expeditionCode) this.getExpeditionId();
      this.prepareLocalContexts(projectId);

    }
    console.log("onchanges triggered")
  }

  prepareMap() {
    const data = [this.record];
    this.map = new RecordMap('decimalLatitude', 'decimalLongitude');
    this.map.on(RecordMap.INIT_EVENT, () => this.map.setMarkers(data));
    this.$timeout(() => {
      this.map.refreshSize();
      this.map.setZoom(2);
    }, 3000);
  }

  getExpeditionId() {
    const {expeditionCode, projectId} = this.record;
    this.ExpeditionService.getExpedition(projectId, expeditionCode).then(
      ({data}) => {
        this.expeditionIdentifier = data.identifier;
      },
    );
  }

  getIdentifier(record) {
    const key = this.project
      ? this.project.config.entityUniqueKey(record.entity)
      : undefined;
    return key ? record[key] : record.bcid;
  }

  mainRecordDetails() {
    if (detailCache.main) {
      return detailCache.main;
    }
    const detailMap = mainRecordDetails[this.record.entity];
    if (!detailMap) return undefined;

    detailCache.main = Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, {[key]: detailMap[key](this.record)}),
      {},
    );
    return detailCache.main;
  }

  auxiliaryRecordDetails(index) {
    if (this.loading) return undefined;

    const numCols = this.$mdMedia('gt-sm') ? 2 : 1;

    if (detailCache[index] && detailCacheNumCols === numCols) {
      return detailCache[index] === {} ? undefined : detailCache[index];
    }

    if (detailCacheNumCols !== numCols) {
      Object.keys(detailCache).forEach(k => {
        if (k !== 'main') delete detailCache[k];
      });
      detailCacheNumCols = numCols;
    }

    const e = this.project.config.entities.find(
      entity => entity.conceptAlias === this.record.entity,
    );
    const flatRecord = flatten(this.record);

    const recordKeys = Object.keys(flatRecord).filter(
      k =>
        (!mainRecordDetails[this.record.entity] ||
          !Object.keys(mainRecordDetails[this.record.entity]).includes(k)) &&
        !['bcid', 'entity', 'bulkLoadFile'].includes(k),
    );

    const sortedKeys = e.attributes.reduce((accumulator, attribute) => {
      if (recordKeys.includes(attribute.column)) {
        accumulator.push(attribute.column);
      }
      return accumulator;
    }, []);

    // add any missing keys to the sortedKeys list
    recordKeys
      .sort()
      .forEach(k => !sortedKeys.includes(k) && sortedKeys.push(k));

    let view = index === 0 ? sortedKeys : [];
    if (numCols > 1) {
      const perCol = Math.ceil(sortedKeys.length / numCols);
      const start = index * perCol;
      if (start > sortedKeys.length) view = [];
      else {
        const last = start + perCol;
        view = sortedKeys.slice(
          start,
          last > sortedKeys.length ? sortedKeys.length : last,
        );
      }
    }
    detailCache[index] = view.reduce((accumulator, key) => {
      const acc = accumulator;
      if (key === 'projectId') {
        acc.project = {
          text: this.project.projectTitle,
          href: `/workbench/project-overview?projectId=${
            this.project.projectId
          }`,
        };
      } else if (key === 'expeditionCode') {
        acc[key] = {
          text: flatRecord[key],
          href: `https://n2t.net/${this.expeditionIdentifier}`,
        };
      } else if (['img128', 'img512', 'img1024'].includes(key)) {
        acc[key] = {
          text: `${key.substring(3)} pixel wide image`,
          href: flatRecord[key],
        };
      } else if (key.match(/URI/i)) {
        acc[key] = {
          text: flatRecord[key],
          href: flatRecord[key],
        };
      } else if (key === 'wormsID') {
        acc[key] = {
          text: flatRecord[key],
          href: 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=' + flatRecord[key].replace('urn:lsid:marinespecies.org:taxname:', ''),
        };
      } else if (key.match(/CatalogNumber/i)) {
        if (flatRecord[key].match(/http/i)) {
          acc[key] = {
            text: flatRecord[key],
            href: flatRecord[key],
          };
        } else {
          acc[key] = flatRecord[key];
        }
      } else {
        acc[key] = flatRecord[key];
      }

      //if (key === 'imageProcessingErrors') {
      //  this.invalidPhoto = true;
      //}

      return acc;
    }, {});

    return detailCache[index] === {} ? undefined : detailCache[index];
  }

  setPhotos() {
    const photoEntities = this.project.config.entities
      .filter(e => e.type === 'Photo')
      .map(e => e.conceptAlias);

    if (!this.children) return;

    const photos = this.children.filter(
      e => photoEntities.includes(e.entity) && e.processed === 'true',
    );
    const hasQualityScore = photos.some(p => p.qualityScore);

    this.photos = photos
      .sort((a, b) =>
        hasQualityScore
          ? a.qualityScore > b.qualityScore
          : a.photoID > b.photoID,
      )
      .map(photo => ({
        id: photo.photoID,
        title: photo.photoID,
        alt: `${photo.photoID} image`,
        bubbleUrl: photo.img128,
        url: photo.img1024,
        extUrl: photo.originalUrl,
      }));
  }

  setParentDetail(parent) {
    if (!parent) return;
    const detailMap = parentRecordDetails[parent.entity];
    this.parentDetail = Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, {[key]: detailMap[key](parent)}),
      {},
    );
  }

  /* concatenate bc and tk labels in response */
  getLocalContextsPresent() {
    return localContextsPresent;
  }

  /* fetch local contexts details at the construction, only populate data if localcontexts project is set
  * Note that we delve into jquery calls and here and call directly to DOM since the LC Hub API did not
  * have proper CORS headers for angular $http calls, which were failing. The jquery XmlHttpRequest
  * is maybe simpler
  */
  prepareLocalContexts(projectId) {
    localContextsPresent = false;
    this.ProjectService.get(projectId)
      .then(project => {
        if (project.localcontextsId) {
          localContextsPresent = true;
          var lcUrl = 'https://localcontextshub.org/api/v1/projects/' + project.localcontextsId + '/?format=json';
		  // This is a temporary storage directory for localcontexts projects that have been created in GEOME
		  //var lcUrl = 'https://raw.githubusercontent.com/biocodellc/geome-ui/master/localcontexts/' + project.localcontextsId 
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.open("GET", lcUrl, true); // false for synchronous request
          xmlHttp.onreadystatechange = function (oEvent) {
            if (xmlHttp.readyState === 4) {
              if (xmlHttp.status === 200) {
                var height = 70

                var localContextsJson = JSON.parse(xmlHttp.responseText);
                // Handle Notices
                try {
                  for (var i = 0; i < localContextsJson.notice.length; i++) {
                    var obj = localContextsJson.notice[i];
                    var div = document.createElement('div');
                    div.setAttribute("style", "padding: 5px;")

                    var img = document.createElement('img');
                    img.src = obj.img_url
                    img.height = height
                    img.setAttribute("style", "padding: 2px; max-height: 70px; float: left;")

                    var spanner = document.createElement('div')
                    spanner.setAttribute("style", "display:block;height:70px;overflow:scroll;")
                    spanner.innerHTML = "<a target=_blank href='" + localContextsJson.project_page + "'>" + obj.name + "</a>"
                    spanner.innerHTML += "<p>" + obj.default_text + "<p>";

                    div.appendChild(img);
                    div.appendChild(spanner);
                    document.getElementById('localContextsLabels').appendChild(div);
                  }
                } catch (e) {
                  console.log(e);
                }
                // Handle Labels
                var allLabels = []
                try {
                  for (var i = 0; i < localContextsJson.bc_labels.length; i++) {
                    allLabels.push(localContextsJson.bc_labels[i]);
                  }
                } catch (e) {
                }
                try {
                  for (var i = 0; i < localContextsJson.tk_labels.length; i++) {
                    allLabels.push(localContextsJson.tk_labels[i]);
                  }
                } catch (e) {
                }

                for (var i = 0; i < allLabels.length; i++) {
                  var obj = allLabels[i];

                  var div = document.createElement('div');
                  div.setAttribute("style", "padding: 5px;")

                  var img = document.createElement('img');
                  img.src = obj.img_url
                  img.height = height
                  img.setAttribute("style", "padding: 2px; max-height: 70px; float: left;")

                  var spanner = document.createElement('div')
                  spanner.setAttribute("style", "display:block;height:70px;overflow:scroll;")
                  spanner.innerHTML = "<a target=_blank href='" + localContextsJson.project_page + "'>" + obj.name + "</a>"
                  spanner.innerHTML += "<p>" + obj.label_text + "<p>";
                  spanner.innerHTML += "<p><i>" + obj.community + "</i>"

                  div.appendChild(img);
                  div.appendChild(spanner);
                  document.getElementById('localContextsLabels').appendChild(div);
                }
                document.getElementById("localContextsHeader").innerHTML = '<b><i>' + localContextsJson.title + "</i></b>";
              } else {
                document.getElementById("localContextsHeader").innerHTML = 'Error Loading Local Contexts Data...';
                console.log("Error", xmlHttp.statusText);
              }
            }
          };
          xmlHttp.send(null);
        }
      });
  }

  setChildDetails(children) {
    if (!children) return;
    const childMap = mapChildren(children);

    const childDetails = c =>
      c.map(child => {
        const detailMap = childRecordDetails[child.entity];
        if (!detailMap) return {};
        return Object.entries(detailMap).reduce(
          (accumulator, [key, fn]) =>
            Object.assign(accumulator, {
              [key]: fn(child),
            }),
          {},
        );
      });

    this.childDetails = Object.entries(childMap).reduce(
      (accumulator, [entity, value]) =>
        Object.assign(accumulator, {
          [entity]: childDetails(value),
        }),
      {},
    );
  }

  fetchProject(projectId) {
    this.loading = true;
    // short-circuit if the project is already loaded
    if (this.currentProject && this.currentProject.projectId === projectId) {
      this.project = this.currentProject;
      this.loading = false;
      return;
    }

    this.ProjectService.get(projectId)
      .then(project => {
        this.project = project;
        this.setPhotos();
        this.sortChildren();
      })
      .catch(() =>
        angular.toaster.error('Failed to fetch project configuration'),
      )
      .finally(() => {
        this.loading = false;
      });
  }

  sortChildren() {
    if (!this.childDetails) return;

    Object.keys(this.childDetails).forEach(conceptAlias => {
      const e = this.project.config.entities.find(
        entity => entity.conceptAlias === conceptAlias,
      );
      this.childDetails[conceptAlias] = this.childDetails[conceptAlias].sort(
        compareValues(`${e.uniqueKey}.text`),
      );
    });
  }
}

export default {
  template,
  controller: RecordController,
  bindings: {
    layout: '@',
    record: '<',
  },
};
