export default class QueryResults {
  constructor() {
    this.size = 0;
    this.total = 0;
    this.data = [];
    this.isSet = false;
  }

  update(data) {
    this.data = this.data.concat(data.data);
    this.isSet = true;
  }

  clear() {
    this.data = [];
    this.isSet = false;
  }
}
