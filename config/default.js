export default {
  naan: 99999,
  restRoot: 'http://localhost:8080/biocode-fims/rest/v2/',
  resolverRoot: 'http://localhost:8080/id/v2/',
  appRoot: '/', // When changing this, also need to change <base> tag in index.html
  mapboxToken: '', // can be set w/ env variable MAPBOX_TOKEN
  fimsClientId: '', // can be set w/ env variable FIMS_CLIENT_ID
  authTimeout: 1000 * 60 * 60 * 4, // 4 hrs
};
