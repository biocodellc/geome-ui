import { QueryBuilder } from './Query';

const QueryType = {
  FUZZY: 1,
  LT: 2,
  LTE: 3,
  GT: 4,
  GTE: 5,
  EQ: 6,
  EXISTS: 7,
};

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
  species: null,
  country: null,
  fromYear: null,
  toYear: null,
  bounds: null,
};

const escapeNum = num => (num < 0 ? `\\${num}` : num);

export default class QueryParams {
  constructor() {
    this.expeditions = [];
    this.filters = [];
    Object.extend(this, defaultParams);
  }

  buildQuery(source) {
    const builder = new QueryBuilder();

    this.expeditions.forEach(e => {
      builder.add(`expedition:${e}`);
    });

    this.filters.forEach(filter => {
      if (filter.value || filter.type === QueryType.EXISTS) {
        switch (QueryType) {
          case QueryType.EXISTS:
            builder.add(`+_exists_:${filter.field}`);
            break;
          case QueryType.EQ:
            builder.add(`+${filter.field}:"${filter.value}"`);
            break;
          case QueryType.LT:
            builder.add(`+${filter.field}:<${filter.value}`);
            break;
          case QueryType.LTE:
            builder.add(`+${filter.field}:<=${filter.value}`);
            break;
          case QueryType.GT:
            builder.add(`+${filter.field}:>${filter.value}`);
            break;
          case QueryType.GTE:
            builder.add(`+${filter.field}:>=${filter.value}`);
            break;
          default:
            builder.add(`+${filter.field}:${filter.value}`);
            break;
        }
      }
    });

    if (this.queryString) {
      builder.add(this.queryString);
    }

    if (this.marker) {
      builder.add(`+fastaSequence.marker:"${this.marker.value}"`);
    }

    if (this.hasSRAAccessions) {
      builder.add('+_exists_:fastqMetadata.bioSample');
    }

    if (this.country) {
      builder.add(`+country:${this.country}`);
    }

    if (this.genus) {
      builder.add(`+genus:${this.genus}`);
    }

    if (this.locality) {
      builder.add(`+locality:${this.locality}`);
    }

    if (this.family) {
      builder.add(`+family:${this.family}`);
    }

    if (this.species) {
      builder.add(`+species:${this.species}`);
    }

    if (this.fromYear) {
      builder.add(`+yearCollected:>=${this.fromYear}`);
    }

    if (this.toYear) {
      builder.add(`+yearCollected:<=${this.toYear}`);
    }

    if (this.isMappable) {
      builder.add('+_exists_:decimalLongitude +_exists_:decimalLatitude');
    }

    if (this.hasCoordinateUncertaintyInMeters) {
      builder.add('+_exists_:coordinateUncertaintyInMeters');
    }

    if (this.hasPermitInfo) {
      builder.add('+_exists_:permitInformation');
    }

    // TODO: fix this b/c it isn't necessarily only geome anymore
    if (this.bounds) {
      const ne = this.bounds.northEast;
      const sw = this.bounds.southWest;

      if (ne.lng > sw.lng) {
        builder.add(`+decimalLongitude:>=${escapeNum(sw.lng)}`);
        builder.add(`+decimalLongitude:<=${escapeNum(ne.lng)}`);
      } else {
        builder.add(
          `+((+decimalLongitude:>=${escapeNum(
            sw.lng,
          )} +decimalLongitude:<=180)`,
        );
        builder.add(
          `(+decimalLongitude:<=${escapeNum(
            ne.lng,
          )} +decimalLongitude:>=\\-180))`,
        );
      }

      builder.add(`+decimalLatitude:<=${escapeNum(ne.lat)}`, QueryType.LTE);
      builder.add(`+decimalLatitude:>=${escapeNum(sw.lat)}`, QueryType.GTE);
    }

    builder.setSource(source);
    return builder.build();
  }

  clear() {
    Object.extend(this, defaultParams);
    this.expeditions = [];
    this.filters = [];
  }
}
