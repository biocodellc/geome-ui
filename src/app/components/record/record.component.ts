import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Subject, take, takeUntil } from 'rxjs';
import { RecordService } from '../../../helpers/services/record.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';
import { RootRecordComponent } from '../root-record/root-record.component';
import { ProjectService } from '../../../helpers/services/project.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MapComponent } from '../query/map/map.component';
import { mainRecordDetails, parentRecordDetails, childRecordDetails } from '../../../helpers/scripts/recordDetails';
import { GalleryModule, GalleryItem, ImageItem, Gallery, GalleryRef } from 'ng-gallery';
import { flatten } from '../../../helpers/scripts/flatten';
import compareValues from '../../../helpers/scripts/compareVal';
import { ExpeditionService } from '../../../helpers/services/expedition.service';
import { ProjectConfig } from '../../../helpers/models/projectConfig.model';
import { NoticeLabelComponent } from '../notice-label/notice-label.component';
import { LightboxModule } from 'ng-gallery/lightbox';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [CommonModule, GalleryModule, LightboxModule, LoaderComponent, RootRecordComponent, NgbTooltipModule, MapComponent, NoticeLabelComponent ],
  templateUrl: './record.component.html',
  styleUrl: './record.component.scss'
})
export class RecordComponent implements AfterViewInit, OnDestroy{
  // Injectors
  private gallery = inject(Gallery);
  private recordService = inject(RecordService);
  private activatetRoute = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  public dummyDataService = inject(DummyDataService);
  private expeditionService = inject(ExpeditionService);

  // Variables
  destroy$:Subject<any> = new Subject();
  record:any;
  recordData:any;
  params:any;
  currentProject!:any;
  project!:any;
  invalidPhoto:boolean = false;
  localContextsPresent:boolean = false;
  detailCacheNumCols:number = 0;
  detailCache:any = {};
  galleryRef!:GalleryRef;
  photos$:BehaviorSubject<GalleryItem[]> = new BehaviorSubject<GalleryItem[]>([]);
  parentDetail!:{ [key: string]: RecordValue };
  childDetails!: { [key: string]: { [key: string]: RecordValue }[] };
  expeditionIdentifier: any;
  mapData:any;
  showThumbs:boolean = false;
  // hideText: boolean = false;

  constructor(){
    this.dummyDataService.loadingState.next(true);
    this.activatetRoute.params.pipe(take(1)).subscribe((params:any) => {
      if(params.bcid_1 && params.bcid_2){
        this.params = params;
      }
    })
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any) => this.currentProject = res);
    this.projectService.getAllProjectsValue().pipe(takeUntil(this.destroy$)).subscribe((res:any) => {
      if(!res) return;
      if(this.params) this.getRecordData();
    })
  }

  ngAfterViewInit(): void {
    this.photos$.pipe(take(2), takeUntil(this.destroy$)).subscribe((photos:GalleryItem[]) => {
      if(!photos.length) return;
      setTimeout(() => {
        this.galleryRef = this.gallery.ref('entityGallery');
        this.galleryRef.setConfig({ loadingStrategy: 'lazy' });
        this.galleryRef.load(photos);
      }, 500);
    })
  }

  getRecordData(){
    const identifier = `ark:/${this.params.bcid_1}/${this.params.bcid_2}`
    this.recordService.get(identifier).pipe(take(1)).subscribe(
      async (res:any) => {
        this.record = res;
        if(this.record?.expedition || this.record?.entityIdentifier) return;
        this.recordData = this.record.record;
        if (this.recordData.expeditionCode) await this.getExpeditionId();
        this.setParentDetail(this.record.parent);
        this.setChildDetails(this.record.children);
        const {projectId} = this.record;
        this.fetchProject(projectId);
        if (this.recordData.entity === 'Event')
          this.mapData = { data:[this.recordData], lat: 'decimalLatitude', lng: 'decimalLongitude' };
      })
  }

  async getExpeditionId() {
    const {expeditionCode, projectId} = this.recordData;
    const res = await lastValueFrom(this.expeditionService.getExpeditionByCode(projectId, expeditionCode));
    this.expeditionIdentifier = res.identifier;
  }

  // Helpers
  setParentDetail(parent:any) {
    if (!parent) return;
    const detailMap = parentRecordDetails[parent.entity];
    this.parentDetail = Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, {[key]: detailMap[key](parent)}),
      {},
    );
  }

  setChildDetails(children:any) {
    if (!children) return;
    const childMap = this.mapChildren(children);

    const childDetails = (c:any) =>
      c.map((child:any) => {
        const detailMap = childRecordDetails[child.entity];
        if (!detailMap) return {};
        return Object.entries(detailMap).reduce(
          (accumulator, [key, fn]:any) =>
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

  mapChildren(children:any){
    return children.reduce((accumulator:any, child:any) => {
      if (!accumulator[child.entity]) accumulator[child.entity] = [];
      accumulator[child.entity].push(child);
      return accumulator;
    }, {});
  }

  async fetchProject(projectId:any) {
    // short-circuit if the project is already loaded
    if (this.currentProject && this.currentProject.projectId === projectId) {
      this.project = { ...this.currentProject };
      this.setPhotos();
      this.sortChildren();
      this.prepareLocalContexts(projectId);
      this.dummyDataService.loadingState.next(false);
      return;
    }

    let projectData = await firstValueFrom(this.projectService.getProject(projectId));
    if(!projectData) return;

    const projectConfigs = await firstValueFrom(this.projectService.getProjectConfig(projectData.projectId));
    if(!projectConfigs) return;

    projectData.config = new ProjectConfig(projectConfigs);
    this.project = projectData;
    this.setPhotos();
    this.sortChildren();
    this.prepareLocalContexts(projectId);
    this.dummyDataService.loadingState.next(false);
  }

  setPhotos() {
    try{
      const photoEntities = this.project.config.entities
        .filter((e:any) => e.type === 'Photo')
        .map((e:any) => e.conceptAlias);

      if (!this.record?.children) return;

      const photos = this.record.children.filter(
        (e:any) => photoEntities.includes(e.entity) && e.processed === 'true',
      );
      const hasQualityScore = photos.some((p:any) => p.qualityScore);

      const photosArr = photos
        .sort((a:any, b:any) =>
          hasQualityScore
            ? a.qualityScore > b.qualityScore
            : a.photoID > b.photoID,
        )
        .map((photo:any) => (
          new ImageItem({
            src: photo.img1024,
            thumb: photo.img128
          })
        ));

      this.photos$.next(photosArr);
      if(this.photos$.value.length >= 2) this.showThumbs = true;
      else this.showThumbs = false;
      console.warn('====Photos Length====',this.photos$.value.length);
    }
    catch(e){
      console.warn('====Photos Error===',e);
    }
  }

  sortChildren() {
    if (!this.childDetails) return;

    Object.keys(this.childDetails).forEach(conceptAlias => {
      const e = this.project.config.entities.find(
        (entity:any) => entity.conceptAlias === conceptAlias,
      );

      this.childDetails[conceptAlias] = this.childDetails[conceptAlias]?.sort(
        compareValues(`${e.uniqueKey}.text`),
      );
    });
  }

  getIdentifier() {
    const key = this.project
      ? this.project.config.entityUniqueKey(this.recordData.entity)
      : undefined;
    return key ? this.recordData[key] : this.recordData.bcid;
  }

  mainRecordDetails():{ [key: string]: RecordValue } {
    if (this.detailCache?.main) {
      return this.detailCache.main;
    }
    const detailMap = mainRecordDetails[this.recordData.entity];
    if (!detailMap) return {};

    this.detailCache.main = Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, {[key]: detailMap[key](this.recordData)}),
      {},
    );
    return this.detailCache.main;
  }

  auxiliaryRecordDetails(index:number):{ [key: string]: RecordValue | any } {
    if (this.dummyDataService.loadingState.value) return {};

    const numCols = 2;//this.$mdMedia('gt-sm') ? 2 : 1;

    if (this.detailCache[index] && this.detailCacheNumCols === numCols) {
      const allKeys:any[] = Object.keys(this.detailCache[index] || []);
      return allKeys.length ? this.detailCache[index] : {};
    }

    if (this.detailCacheNumCols !== numCols) {
      Object.keys(this.detailCache).forEach(k => {
        if (k !== 'main') delete this.detailCache[k];
      });
      this.detailCacheNumCols = numCols;
    }

    const e = this.project.config.entities.find(
      (entity:any) => entity.conceptAlias === this.recordData.entity,
    );
    const flatRecord = flatten(this.recordData);

    const recordKeys = Object.keys(flatRecord).filter(
      k =>
        (!mainRecordDetails[this.recordData.entity] ||
          !Object.keys(mainRecordDetails[this.recordData.entity]).includes(k)) &&
        !['bcid', 'entity', 'bulkLoadFile'].includes(k),
    );

    const sortedKeys = e.attributes.reduce((accumulator: any, attribute: any) => {
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
    this.detailCache[index] = view.reduce((accumulator:any, key:any) => {
      const acc = accumulator;
      if (key === 'projectId') {
        acc.project = {
          text: this.project.projectTitle,
          href: `/workbench/project-overview?projectId=${this.project.projectId
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

    const allKeys:any[] = Object.keys(this.detailCache[index] || [])
    return  allKeys.length ? this.detailCache[index] : {};
  }

  /* fetch local contexts details at the construction, only populate data if localcontexts project is set
  * Note that we delve into jquery calls and here and call directly to DOM since the LC Hub API did not
  * have proper CORS headers for angular $http calls, which were failing. The jquery XmlHttpRequest
  * is maybe simpler
  */
  prepareLocalContexts(projectId:any) {
    this.localContextsPresent = false;
    this.projectService.getProject(projectId).pipe(take(1), takeUntil(this.destroy$))
      .subscribe((project:any) => {
        if (project.localcontextsId) {
          this.localContextsPresent = true;
          var lcUrl = 'https://localcontextshub.org/api/v1/projects/' + project.localcontextsId + '/?format=json';
          // This is a temporary storage directory for localcontexts projects that have been created in GEOME
          //var lcUrl = 'https://raw.githubusercontent.com/biocodellc/geome-ui/master/localcontexts/' + project.localcontextsId 
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.open("GET", lcUrl, true); // false for synchronous request
          xmlHttp.onreadystatechange = function (oEvent) {
            if (xmlHttp.readyState === 4) {
              if (xmlHttp.status === 200) {
                const height = 70
                const localContextsJson = JSON.parse(xmlHttp.responseText);

                // Clear containers
                // const labelContainer = document.getElementById('localContextsLabels');
                const thumbContainer = document.getElementById('localContextsThumbnails');
                // if (labelContainer) labelContainer.innerHTML = '';
                if (thumbContainer) thumbContainer.innerHTML = '';

                // Notices
                try {
                  for (let i = 0; i < localContextsJson.notice?.length || 0; i++) {
                    const obj = localContextsJson.notice[i];

                    // Add image to thumbnails
                    if (thumbContainer) {
                      const thumbImg = document.createElement('img');
                      thumbImg.src = obj.img_url;
                      thumbImg.height = height;
                      thumbImg.setAttribute("style", "margin: 4px; object-fit: contain;");
                      const anchorTag = document.createElement('a');
                      anchorTag.href = localContextsJson.project_page;
                      anchorTag.target = '_blank';

                      anchorTag.appendChild(thumbImg);
                      thumbContainer.appendChild(anchorTag);
                    }

                    // Add text to label list
                  //   if (labelContainer) {
                  //     const div = document.createElement('div');
                  //     div.setAttribute("style", "padding: 5px;");
                  //     const textHTML = `
                  //   <a target="_blank" href="${localContextsJson.project_page}">${obj.name}</a>
                  //   <p>${obj.default_text || ''}</p>
                  // `;
                  //     div.innerHTML = textHTML;
                  //     labelContainer.appendChild(div);
                  //   }
                  }
                } catch (e) {
                  console.warn(e);
                }

                // Labels (BC and TK)
                const allLabels = [];
                try {
                  allLabels.push(...(localContextsJson.bc_labels || []));
                  allLabels.push(...(localContextsJson.tk_labels || []));
                } catch (e) {
                  console.warn(e);
                }

                for (let i = 0; i < allLabels.length; i++) {
                  const obj = allLabels[i];

                  // Add image to thumbnails
                  if (thumbContainer) {
                    const thumbImg = document.createElement('img');
                    thumbImg.src = obj.img_url;
                    thumbImg.height = height;
                    thumbImg.setAttribute("style", "margin: 4px; object-fit: contain;");

                    const anchorTag = document.createElement('a');
                    anchorTag.href = localContextsJson.project_page;
                    anchorTag.target = '_blank';

                    anchorTag.appendChild(thumbImg);
                    thumbContainer.appendChild(anchorTag);
                  }

                  // Add text to label list
                  // if (labelContainer) {
                  //   const div = document.createElement('div');
                  //   div.setAttribute("style", "padding: 5px;");
                  //   const textHTML = `
                  //     <a target="_blank" href="${localContextsJson.project_page}">${obj.name}</a>
                  //     <p>${obj.label_text || ''}</p>
                  //     ${obj.community ? `<p><i>${obj.community}</i></p>` : ''}
                  //   `;
                  //   div.innerHTML = textHTML;
                  //   labelContainer.appendChild(div);
                  // }
                }

                // Set header
                const ref = document.getElementById("localContextsHeader");
                if (ref) ref.innerHTML = '<b><i>' + localContextsJson.title + "</i></b>";
              } else {
                const ref = document.getElementById("localContextsHeader");
                if (ref) ref.innerHTML = 'Error Loading Local Contexts Data...';
                console.log("Error", xmlHttp.statusText);
              }
            }
          };
          xmlHttp.send(null);
        }
      });
  }

  getKeysArr(obj:{}):any[]{
    const prioritizedKey = Object.keys(obj).find(key => key.toLowerCase().includes('id'));
    const data = Object.keys(obj).sort((a, b) => {
      if (a === prioritizedKey) return -1;
      if (b === prioritizedKey) return 1;
      return 0; // Keep others as-is
    })
    return data || [];
  }


  // Hidetext() {
  //   this.hideText = !this.hideText
  // }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}


interface RecordValue {
  href?: string;
  text?: string;
}