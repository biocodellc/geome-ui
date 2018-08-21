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
    return (
      `<strong>Phylum</strong>:  ${phylum}<br>` +
      `<strong>Genus</strong>:  ${genus}<br>` +
      `<strong>Species</strong>:  ${species}<br>` +
      `<strong>Year Collected</strong>:  ${event.yearCollected}<br>` +
      `<strong>Locality, Country</strong>:  ${event.locality}, ${
        event.country
      }<br>` +
      `<a href='${this.$state.href('record', {
        bcid,
      })}' target='_blank'>Sample details</a><br>` +
      `<a href='${this.$state.href('record', {
        bcid: event.bcid,
      })}' target='_blank'>Event details</a>`
    );
  }
}
