export class Query {
  constructor(queryString, source) {
    this.q = queryString;
    this.source = source;
    this.networkId = 1; // GEOME Network
  }
}

export class QueryBuilder {
  constructor() {
    this.source = [];
    this.queryString = '';
  }

  add(q) {
    this.queryString += `${q} `;
  }

  setSource(source) {
    this.source = source;
  }

  build() {
    if (this.queryString.trim().length === 0) {
      this.queryString = '*';
    }
    return new Query(this.queryString, this.source);
  }
}
