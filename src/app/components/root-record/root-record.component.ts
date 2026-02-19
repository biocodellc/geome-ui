import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { childRecordDetails, mainRecordDetails, parentRecordDetails } from '../../../helpers/scripts/recordDetails';
import { Router } from '@angular/router';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';

@Component({
  selector: 'app-root-record',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './root-record.component.html',
  styleUrl: './root-record.component.scss'
})
export class RootRecordComponent implements OnChanges{
  router = inject(Router);
  dummyDataService = inject(DummyDataService);

  // Variables
  @Input() record:any;
  header:string = '';
  parentEntity:string = '';
  parentDetail!:{ [key: string]: RecordValue };
  childDetails!:{ [key: string]: RecordValue };
  mainRecordDetails!:{ [key: string]: RecordValue };

  data:any;
  parent:any;
  childData:any;
  entity:string = '';
  permitGuid:string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['record'] && changes['record']?.currentValue){
      this.assignValues();
    }
  }

  assignValues(){
    if (this.record.expedition) {
      this.entity = 'expedition';
      this.parentEntity = 'Project';
      this.data = this.record.expedition;
      this.parent = this.data.project;
      this.childData = this.data.entityIdentifiers;
      this.header = this.data.expeditionTitle.concat(
        ' (',
        this.data.expeditionCode,
        ')',
      );
    } else if (this.record.entityIdentifier) {
      this.entity = 'entityIdentifier';
      this.parentEntity = 'Expedition';
      this.data = this.record.entityIdentifier;
      this.parent = this.data.expedition;
      this.childData = this.data;
      const plural = this.data.conceptAlias.endsWith('s') ? ' ' : 's';
      this.header = this.data.expedition.expeditionTitle.concat(
        ' ',
        this.data.conceptAlias,
        plural,
      );
    }
    this.prepareChildDetails(this.childData);
    this.prepareParentDetails(this.parent);
    this.prepareMainDetails(this.data);
    this.permitGuid = this.getProjectPermitGuid();
    setTimeout(() => {
      this.dummyDataService.loadingState.next(false);
    }, 100);
  }

  private getProjectPermitGuid(): string {
    return (
      this.record?.expedition?.project?.permitGuid ||
      this.record?.entityIdentifier?.expedition?.project?.permitGuid ||
      this.parent?.project?.permitGuid ||
      ''
    );
  }

  private resolveGuidLink(value:any): string {
    const raw = `${value || ''}`.trim();
    if (!raw) return '';

    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^doi:\s*/i.test(raw)) return `https://doi.org/${raw.replace(/^doi:\s*/i, '')}`;
    if (/^doi\.org\//i.test(raw)) return `https://${raw}`;
    if (/^10\.\S+/i.test(raw)) return `https://doi.org/${raw}`;
    if (/^ark:\//i.test(raw)) return `https://n2t.net/${raw}`;

    return '';
  }

  get permitGuidLink(): string {
    return this.resolveGuidLink(this.permitGuid);
  }

  prepareMainDetails(data:any) {
    const detailMap = mainRecordDetails[this.entity];
    this.mainRecordDetails = this.makeDetailObject(data, detailMap);
  }

  prepareParentDetails(parent:any) {
    const detailMap = parentRecordDetails[this.entity];
    this.parentDetail = this.makeDetailObject(parent, detailMap);
  }

  prepareChildDetails(children:any) {
    const detailMap = childRecordDetails[this.entity];

    if (Array.isArray(children)) {
      const childDetails = {};
      children.forEach(ch => {
        const { conceptAlias } = ch;
        const value = Object.keys(detailMap).reduce(
          (accumulator, key) => Object.assign(accumulator, detailMap[key](ch)),
          {},
        );
        this.childDetails = Object.assign(childDetails, {
          [conceptAlias]: value,
        });
      });
    } else {
      this.childDetails = this.makeDetailObject(children, detailMap);
    }
  }

  makeDetailObject(data:any, detailMap:any) {
    return Object.keys(detailMap).reduce(
      (accumulator, key) =>
        Object.assign(accumulator, { [key]: detailMap[key](data) }),
      {},
    );
  }

  query(href:string) {
    if (
      href === 'query' &&
      this.record.entityIdentifier.conceptAlias !== 'Sample_Photo' &&
      this.record.entityIdentifier.conceptAlias !== 'Event_Photo'
    ) {
      const q = this.record.entityIdentifier.expedition.expeditionCode;
      const entity = this.record.entityIdentifier.conceptAlias;
      this.router.navigateByUrl(`/query?q=_expeditions_:[${q}]&entity=${entity}`);
    } else this.router.navigateByUrl(href);
  }

  getValue(data:string|object|undefined){
    if(typeof data == 'object' && !Array.isArray(data)) return JSON.stringify(data);
    else return data;
  }
}

interface RecordValue {
  href?: string;
  text?: string;
  queryLink?:string
}
