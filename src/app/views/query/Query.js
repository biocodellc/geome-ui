export class Query {
  constructor(queryString, source, projectId) {
    this.q = queryString;
    this.source = source;
    this.projectId = projectId;
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

  setProjectId(projectId) {
    this.projectId = projectId;
  }

  build() {
    if (this.queryString.trim().length === 0) {
      this.queryString = '*';
    }
    return new Query(this.queryString, this.source, this.projectId);
  }
}
