export default class QueryResults {
  constructor() {
    this.size = 0;
    this.total = 0;
    this.data = [];
    this.isSet = false;
  }

  update(data) {
    // TODO: check data object type
    console.log(data);
    this.data = this.data.concat(data);
    this.isSet = true;
  }

  clear() {
    this.data = [];
    this.isSet = false;
  }
}
