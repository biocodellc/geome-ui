import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { childRecordDetails, mainRecordDetails, parentRecordDetails } from '../../../helpers/scripts/recordDetails';
import { Router } from '@angular/router';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';
import { flatten } from '../../../helpers/scripts/flatten';
import { ProjectService } from '../../../helpers/services/project.service';
import { catchError, forkJoin, of, take } from 'rxjs';
import { QueryService } from '../../../helpers/services/query.service';
import { QueryParams } from '../../../helpers/scripts/queryParam';

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
  projectService = inject(ProjectService);
  queryService = inject(QueryService);

  // Variables
  @Input() record:any;
  header:string = '';
  headerMeta:string = '';
  parentEntity:string = '';
  parentDetail!:{ [key: string]: RecordValue };
  childDetails!:{ [key: string]: RecordValue };
  mainRecordDetails!:{ [key: string]: RecordValue };

  data:any;
  parent:any;
  childData:any;
  entity:string = '';
  entityMapRoots: EntityMapNode[] = [];
  entityMapLoaded:boolean = false;
  entityMapCountsLoaded:boolean = false;
  totalEntityMapRecords:number = 0;
  permitGuid:string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['record'] && changes['record']?.currentValue){
      this.assignValues();
    }
  }

  assignValues(){
    this.entityMapRoots = [];
    this.entityMapLoaded = false;
    this.entityMapCountsLoaded = false;
    this.totalEntityMapRecords = 0;
    this.headerMeta = '';

    if (this.record.expedition) {
      this.entity = 'expedition';
      this.parentEntity = 'Project';
      this.data = this.record.expedition;
      this.parent = this.data.project;
      this.childData = this.data.entityIdentifiers;
      this.header = this.data.expeditionTitle;
      this.headerMeta = `Expedition code=${this.data.expeditionCode}`;
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
    this.prepareEntityMap();
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
    const details = this.makeDetailObject(data, detailMap);
    const parentProject = this.getParentProjectInfo();

    if (!parentProject) {
      this.mainRecordDetails = details;
      return;
    }

    const orderedDetails:any = {};
    Object.entries(details).forEach(([key, value]) => {
      orderedDetails[key] = value;
      if (key === 'modified') {
        orderedDetails.parentProject = {
          text: `${parentProject.title} (id=${parentProject.id})`,
          href: parentProject.href,
        };
      }
    });

    if (!orderedDetails.parentProject) {
      orderedDetails.parentProject = {
        text: `${parentProject.title} (id=${parentProject.id})`,
        href: parentProject.href,
      };
    }

    this.mainRecordDetails = orderedDetails;
  }

  prepareParentDetails(parent:any) {
    const detailMap = parentRecordDetails[this.entity];
    this.parentDetail = this.makeDetailObject(parent, detailMap);
  }

  prepareChildDetails(children:any) {
    this.childDetails = {};
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

  prepareEntityMap() {
    if (this.entity !== 'expedition') return;

    const project =
      this.record?.expedition?.project ||
      this.record?.entityIdentifier?.expedition?.project;

    const projectId = project?.projectId;
    if (!projectId) return;

    this.projectService
      .getProjectConfig(project)
      .pipe(take(1))
      .subscribe({
        next: (config:any) => {
          const entities = Array.isArray(config?.entities) ? config.entities : [];
          const identifiers = Array.isArray(this.childData) ? this.childData : [];
          this.entityMapRoots = this.buildEntityMap(entities, identifiers);
          this.loadEntityMapCounts(projectId, this.record?.expedition?.expeditionCode, identifiers);
          this.entityMapLoaded = true;
        },
        error: () => {
          this.entityMapRoots = [];
          this.entityMapCountsLoaded = true;
          this.totalEntityMapRecords = 0;
          this.entityMapLoaded = true;
        },
      });
  }

  buildEntityMap(entities:any[], identifiers:any[]): EntityMapNode[] {
    if (!entities.length) return [];

    const entityByAlias = new Map(
      entities
        .filter(entity => entity?.conceptAlias)
        .map(entity => [entity.conceptAlias, entity]),
    );

    const childrenByParent = new Map<string, string[]>();
    entities.forEach(entity => {
      const parentAlias = entity?.parentEntity;
      const alias = entity?.conceptAlias;
      if (!parentAlias || !alias) return;
      if (!childrenByParent.has(parentAlias)) childrenByParent.set(parentAlias, []);
      childrenByParent.get(parentAlias)?.push(alias);
    });

    const availableByAlias = new Map<string, string>();
    identifiers.forEach((identifier:any) => {
      if (!identifier?.conceptAlias) return;
      if (identifier?.identifier && !availableByAlias.has(identifier.conceptAlias)) {
        availableByAlias.set(identifier.conceptAlias, identifier.identifier);
      }
    });

    const aliasesToShow = this.collectRelevantAliases(entityByAlias, availableByAlias);
    const roots = entities
      .filter(entity => {
        const alias = entity?.conceptAlias;
        return (
          alias &&
          aliasesToShow.has(alias) &&
          (!entity.parentEntity || !entityByAlias.has(entity.parentEntity))
        );
      })
      .sort((a, b) => this.sortAliases(a?.conceptAlias, b?.conceptAlias))
      .map(entity =>
        this.buildEntityMapNode(
          entity.conceptAlias,
          childrenByParent,
          availableByAlias,
          aliasesToShow,
        ),
      );

    return roots.filter(Boolean);
  }

  collectRelevantAliases(entityByAlias:Map<string, any>, availableByAlias:Map<string, string>): Set<string> {
    const aliases = new Set<string>();
    const availableAliases = Array.from(availableByAlias.keys());

    if (!availableAliases.length) {
      entityByAlias.forEach((_, alias) => aliases.add(alias));
      return aliases;
    }

    availableAliases.forEach(alias => {
      let current:string | undefined = alias;
      while (current && !aliases.has(current)) {
        aliases.add(current);
        current = entityByAlias.get(current)?.parentEntity;
      }
    });

    return aliases;
  }

  buildEntityMapNode(
    alias:string,
    childrenByParent:Map<string, string[]>,
    availableByAlias:Map<string, string>,
    aliasesToShow:Set<string>,
  ): EntityMapNode {
    const childAliases = (childrenByParent.get(alias) || [])
      .filter(childAlias => aliasesToShow.has(childAlias))
      .sort((a, b) => this.sortAliases(a, b));

    return {
      alias,
      label: this.normalizeEntityLabel(alias),
      identifier: availableByAlias.get(alias),
      count: null,
      available: availableByAlias.has(alias),
      children: childAliases.map(childAlias =>
        this.buildEntityMapNode(childAlias, childrenByParent, availableByAlias, aliasesToShow),
      ),
    };
  }

  get entityMapSummary(): string {
    if (!this.entityMapCountsLoaded) {
      return 'Loading actual record counts for this expedition.';
    }
    const entityCount = this.countAvailableEntityTypes(this.entityMapRoots);
    const recordLabel = this.totalEntityMapRecords === 1 ? 'record' : 'records';
    const entityLabel = entityCount === 1 ? 'entity type' : 'entity types';
    return `${this.totalEntityMapRecords} ${recordLabel} across ${entityCount} ${entityLabel} in this expedition.`;
  }

  private countAvailableEntityTypes(nodes:EntityMapNode[]): number {
    return nodes.reduce((total, node) => {
      const current = (node.count || 0) > 0 ? 1 : 0;
      return total + current + this.countAvailableEntityTypes(node.children);
    }, 0);
  }

  private loadEntityMapCounts(projectId:any, expeditionCode:string, identifiers:any[]): void {
    if (!projectId || !expeditionCode) {
      this.entityMapCountsLoaded = true;
      return;
    }

    const aliases = Array.from(
      new Set(
        identifiers
          .map((identifier:any) => identifier?.conceptAlias)
          .filter((alias:string | undefined) => !!alias),
      ),
    );

    if (!aliases.length) {
      this.entityMapCountsLoaded = true;
      return;
    }

    const params = new QueryParams();
    params.projects = [{ projectId: String(projectId) }];
    params.expeditions = [{ expeditionCode }];
    const query = params.buildQuery();

    const requests = aliases.reduce((accumulator:Record<string, any>, alias:string) => {
      accumulator[alias] = this.queryService
        .countJson(query, this.getCountQueryEntityForAlias(alias))
        .pipe(catchError(() => of(0)));
      return accumulator;
    }, {} as Record<string, any>);

    forkJoin(requests).subscribe((counts:any) => {
      this.totalEntityMapRecords = (Object.values(counts) as number[]).reduce((sum, count) => sum + count, 0);
      this.entityMapRoots = this.applyEntityCounts(this.entityMapRoots, counts);
      this.entityMapCountsLoaded = true;
    });
  }

  private applyEntityCounts(nodes:EntityMapNode[], counts:Record<string, number>): EntityMapNode[] {
    return nodes
      .map(node => {
        const children = this.applyEntityCounts(node.children, counts);
        const count = counts[node.alias] ?? 0;
        return {
          ...node,
          count,
          children,
        };
      })
      .filter(node => node.count > 0 || node.children.length > 0);
  }

  private getCountQueryEntityForAlias(alias:string): string {
    if (alias === 'Fastq') return 'fastqMetadata';
    return alias;
  }

  sortAliases(a:string, b:string): number {
    const preferredOrder = ['Event', 'Sample', 'Tissue'];
    const indexA = preferredOrder.indexOf(a);
    const indexB = preferredOrder.indexOf(b);
    const normalizedA = this.normalizeEntityLabel(a).toLowerCase();
    const normalizedB = this.normalizeEntityLabel(b).toLowerCase();

    if (indexA !== -1 || indexB !== -1) {
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    }

    return normalizedA.localeCompare(normalizedB);
  }

  openEntityMapNode(node:EntityMapNode) {
    if (!node?.available) return;
    const expeditionCode = this.record?.expedition?.expeditionCode;
    const projectId = this.record?.expedition?.project?.projectId;
    if (!expeditionCode) return;
    this.router.navigate(['/query'], {
      queryParams: {
        projectId,
        expeditionCode,
        entity: this.getQueryEntityForAlias(node.alias),
      },
    });
  }

  getQueryEntityForAlias(alias:string): string {
    if (alias === 'fastqMetadata') return 'Fastq';
    if (alias === 'Extraction' || alias === 'Extraction_Details') return 'Extraction';
    return alias;
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

  formatLabel(key:string): string {
    if (!key) return '';
    if (key === 'modified') return 'Last Modified';
    return key
      .split('.')
      .map((segment:string) =>
        segment
          .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase())
      )
      .join(': ');
  }

  formatValue(data:any): string {
    if (data === undefined || data === null || data === '') return 'N/A';
    if (typeof data === 'boolean') return data ? 'Yes' : 'No';
    if (Array.isArray(data)) {
      const values = data
        .map(item => this.formatValue(item))
        .filter(item => item && item !== 'N/A');
      return values.length ? values.join(', ') : 'N/A';
    }
    if (typeof data === 'object') {
      const flattenedValue = flatten(data);
      const entries = Object.entries(flattenedValue).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      );
      if (!entries.length) return 'N/A';
      return entries
        .map(([key, value]) => `${this.formatLabel(key)}: ${value}`)
        .join('; ');
    }
    return `${data}`;
  }

  getLinkedText(value:RecordValue | any): string {
    return this.formatValue(value?.text ?? value?.href);
  }

  getParentProjectInfo():
    | { title: string; id: string | number; href: string }
    | undefined {
    const project =
      this.record?.expedition?.project ||
      this.record?.entityIdentifier?.expedition?.project;

    if (!project?.projectTitle || !project?.projectId) return undefined;

    return {
      title: project.projectTitle,
      id: project.projectId,
      href: `/workbench/project-overview?projectId=${project.projectId}`,
    };
  }

  normalizeEntityLabel(entity:string): string {
    if (!entity) return '';
    if (/^diagnosticss?$/i.test(entity)) return 'Diagnostics';
    if (entity.toLowerCase().includes('extraction')) return 'Extraction Details';
    return entity;
  }
}

interface RecordValue {
  href?: string;
  text?: string;
  queryLink?:string
}

interface EntityMapNode {
  alias: string;
  label: string;
  identifier?: string;
  count: number | null;
  available: boolean;
  children: EntityMapNode[];
}
