import Map from '../../components/map/map';

export default class QueryMap extends Map {
  constructor($state, latColumn, lngColumn) {
    super(latColumn, lngColumn);
    this.$state = $state;
  }

  setMarkers(data) {
    return super.setMarkers(data, this.generatePopupContent.bind(this));
  }

  generatePopupContent({ bcid, phylum, genus, species, event }) {
    let loc = '';
    if (event.locality && event.country) {
      loc = `<strong>Locality, Country</strong>:  ${event.locality}, ${
        event.country
      }<br>`;
    } else if (event.locality) {
      loc = `<strong>Locality</strong>:  ${event.locality}<br>`;
    } else if (event.country) {
      loc = `<strong>Country</strong>:  ${event.country}<br>`;
    }
    return (
      `${`<strong>Phylum</strong>:  ${phylum}<br>` +
        `<strong>Genus</strong>:  ${genus || 'N/A'}<br>` +
        `<strong>Species</strong>:  ${species || 'N/A'}<br>` +
        `<strong>Year Collected</strong>:  ${
          event.yearCollected
        }<br>`}${loc}<a href='${this.$state.href('record', {
        bcid,
      })}' target='_blank'>Sample details</a><br>` +
      `<a href='${this.$state.href('record', {
        bcid: event.bcid,
      })}' target='_blank'>Event details</a>`
    );
  }
}
