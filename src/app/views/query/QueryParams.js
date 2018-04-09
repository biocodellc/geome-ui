import { QueryBuilder } from './Query';

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
    Object.assign(this, defaultParams);
  }

  buildQuery(source) {
    const builder = new QueryBuilder();

    if (this.expeditions.length > 0) {
      builder.add(
        `_expeditions_:[${this.expeditions.map(e => e.expeditionCode)}]`,
      );
    }

    this.filters.forEach(filter => {
      if (filter.value || filter.type === 'has') {
        if (builder.queryString.length > 0) {
          builder.add('and');
        }

        switch (filter.type) {
          case 'has':
            builder.add(`_exists_:${filter.field}`);
            break;
          case 'fuzzy':
            builder.add(`${filter.field}:${filter.value}`);
            break;
          case 'like':
            if (!filter.value.includes('%')) filter.value = `%${filter.value}%`;
            builder.add(`${filter.field}::${filter.value}`);
            break;
          default:
            builder.add(`${filter.field} ${filter.type} ${filter.value}`);
        }
      }
    });

    if (this.queryString) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add(this.queryString);
    }

    if (this.marker) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add(`fastaSequence.marker = "${this.marker.value}"`);
    }

    if (this.hasSRAAccessions) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add('_exists_:fastqMetadata.bioSample');
    }

    if (this.country) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add(`country = ${this.country}`);
    }

    if (this.genus) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add(`genus = ${this.genus}`);
    }

    if (this.locality) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add(`locality = ${this.locality}`);
    }

    if (this.family) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add(`family = ${this.family}`);
    }

    if (this.species) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add(`species = ${this.species}`);
    }

    if (this.fromYear) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add(`yearCollected >= ${this.fromYear}`);
    }

    if (this.toYear) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add(`yearCollected <= ${this.toYear}`);
    }

    if (this.isMappable) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add('_exists_:decimalLongitude and _exists_:decimalLatitude');
    }

    if (this.hasCoordinateUncertaintyInMeters) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add('_exists_:coordinateUncertaintyInMeters');
    }

    if (this.hasPermitInfo) {
      if (builder.queryString.length > 0) builder.add('and');
      builder.add('_exists_:permitInformation');
    }

    // TODO: fix this b/c it isn't necessarily only geome anymore
    if (this.bounds) {
      const ne = this.bounds.northEast;
      const sw = this.bounds.southWest;

      if (ne.lng > sw.lng) {
        if (builder.queryString.length > 0) builder.add('and');
        builder.add(`decimalLongitude >= ${escapeNum(sw.lng)}`);
        builder.add(`and decimalLongitude <= ${escapeNum(ne.lng)}`);
      } else {
        if (builder.queryString.length > 0) builder.add('and');
        builder.add(
          `((decimalLongitude >= ${escapeNum(
            sw.lng,
          )} and decimalLongitude <= 180)`,
        );
        builder.add(
          `or (decimalLongitude <= ${escapeNum(
            ne.lng,
          )} or decimalLongitude >= \\-180))`,
        );
      }
      if (builder.queryString.length > 0) builder.add('and');
      builder.add(`decimalLatitude <= ${escapeNum(ne.lat)}`);
      builder.add(`and decimalLatitude >= ${escapeNum(sw.lat)}`);
    }

    builder.setSource(source);
    return builder.build();
  }

  clear() {
    Object.assign(this, defaultParams);
    this.expeditions = [];
    this.filters = [];
  }
}
