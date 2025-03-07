import { Query, QueryBuilder } from '../services/query.service';

const defaultParams = {
  queryString: null,
  marker: null,
  hasSRAAccessions: false,
  isMappable: false,
  hasCoordinateUncertaintyInMeters: false,
  hasPermitInfo: false,
  genus: null,
  locality: null,
  family: null,
  phylum: null,
  specificEpithet: null,
  country: null,
  fromYear: null,
  toYear: null,
  bounds: null,
  materialSampleID: null,
};

export class QueryParams {
  projects: Array<{ projectId: string }> = [];
  expeditions: Array<{ expeditionCode: string }> = [];
  filters: Array<{ column: string; value?: string; type: string }> = [];
  queryString: any;
  marker: any;
  country: any;
  materialSampleID: any;
  genus: any;
  locality: any;
  family: any;
  phylum: any;
  specificEpithet: any;
  fromYear: any;
  toYear: any;
  bounds: any;

  // New Variables
  isMappable:boolean = false;
  hasCoordinateUncertaintyInMeters:boolean = false;
  hasPermitInfo:boolean = false;
  hasTissue:boolean = false;
  hasSamplePhoto:boolean = false;
  hasEventPhoto:boolean = false;
  hasFasta:boolean = false;
  hasSRAAccessions:boolean = false;

  constructor() {
    // Object.assign(this, defaultParams);
  }

  buildQuery(selectEntities?: string[], source?: string): Query {
    const builder = new QueryBuilder();

    if (this.projects.length) {
      builder.add(`_projects_:${this.projects.map(p => p.projectId).join(',')}`);
    }

    if (this.expeditions.length) {
      builder.add('_expeditions_:[' + this.expeditions.map(e => e.expeditionCode).join(',') + ']');
    }

    this.filters.forEach(({ column, value, type }) => {
      if (value || type === 'has') {
        builder.add('' + this.getFilterQuery(column, value, type));
      }
    });

    this.addSimpleConditions(builder);
    this.addBoundsConditions(builder);

    if (selectEntities?.length) {
      builder.add(`_select_:[${selectEntities.join(',')}]`);
    }

    builder.setSource(source || '');
    return builder.build();
  }

  private getFilterQuery(column: string, value: string | undefined, type: string): string {
    switch (type) {
      case 'has': return `_exists_:${column}`;
      case 'fuzzy': return `${column}:${value}`;
      case 'like': return `${column}::"%${value}%"`;
      case '<': case '<=': case '>': case '>=':
        return `${column} ${type} ${value}`;
      default:
        return `${column} ${type} "${value}"`;
    }
  }

  private addSimpleConditions(builder: QueryBuilder): void {
    const conditions: [string, any][] = [
      ['queryString', this.queryString],
      ['marker', this.marker],
      ['hasSRAAccessions', '_exists_:fastqMetadata.bioSample'],
      ['country', `Event.country = "${this.country}"`],
      ['materialSampleID', `Sample.materialSampleID = "${this.materialSampleID}"`],
      ['genus', `Sample.genus = "${this.genus}"`],
      ['locality', `Event.locality = "${this.locality}"`],
      ['family', `Sample.family = "${this.family}"`],
      ['phylum', `Sample.phylum = "${this.phylum}"`],
      ['specificEpithet', `Sample.specificEpithet = "${this.specificEpithet}"`],
      ['fromYear', `Event.yearCollected >= ${this.fromYear}`],
      ['toYear', `Event.yearCollected <= ${this.toYear}`],
      ['isMappable', '_exists_:Event.decimalLongitude and _exists_:Event.decimalLatitude'],
      ['hasCoordinateUncertaintyInMeters', '_exists_:Event.coordinateUncertaintyInMeters'],
      ['hasPermitInfo', '_exists_:Event.permitInformation'],
      ['hasTissue', '_exists_:Tissue.tissueID'],
      ['hasSamplePhoto', '_exists_:Sample_Photo.photoID'],
      ['hasEventPhoto', '_exists_:Event_Photo.photoID'],
      ['hasFasta', '_exists_:fastaSequence.sequence'],
    ];
    conditions.forEach(([key, value]) => {
      if (this[key as keyof this]) builder.add('and ' +value );
    });
  }

  private addBoundsConditions(builder: QueryBuilder): void {
    if (!this.bounds) return;
    const { northEast: ne, southWest: sw } = this.bounds;
    builder.add(`Event.decimalLatitude BETWEEN ${sw.lat} AND ${ne.lat}`);
    if (ne.lng > sw.lng) {
      builder.add(`Event.decimalLongitude BETWEEN ${sw.lng} AND ${ne.lng}`);
    } else {
      builder.add(
        `(Event.decimalLongitude BETWEEN ${sw.lng} AND 180 OR Event.decimalLongitude BETWEEN -180 AND ${ne.lng})`
      );
    }
  }

  clear(): void {
    Object.assign(this, defaultParams);
    this.expeditions = [];
    this.filters = [];
  }
}
