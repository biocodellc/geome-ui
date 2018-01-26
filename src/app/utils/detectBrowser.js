const BrowserDetect = {
  init() {
    this.browser = this.searchString(this.dataBrowser) || 'Other';
    this.version =
      this.searchVersion(navigator.userAgent) ||
      this.searchVersion(navigator.appVersion) ||
      'Unknown';
  },

  searchString(data) {
    for (let i = 0; i < data.length; i++) {
      const dataString = data[i].string;
      this.versionSearchString = data[i].subString;

      if (dataString.indexOf(data[i].subString) != -1) {
        return data[i].identity;
      }
    }
  },

  searchVersion(dataString) {
    const index = dataString.indexOf(this.versionSearchString);
    if (index == -1) return;
    return parseFloat(
      dataString.substring(index + this.versionSearchString.length + 1),
    );
  },

  dataBrowser: [
    { string: navigator.userAgent, subString: 'Chrome', identity: 'Chrome' },
    { string: navigator.userAgent, subString: 'MSIE', identity: 'Explorer' },
    { string: navigator.userAgent, subString: 'Firefox', identity: 'Firefox' },
    { string: navigator.userAgent, subString: 'Safari', identity: 'Safari' },
    { string: navigator.userAgent, subString: 'Opera', identity: 'Opera' },
  ],
};
BrowserDetect.init();

export default () => ({
  browser: BrowserDetect.browser,
  version: BrowserDetect.version,
});
