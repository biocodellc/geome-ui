export default class QueryMap extends Map {
  constructor($state, latColumn, lngColumn) {
    super(latColumn, lngColumn);
    this.$state = $state;
  }

  setMarkers(data) {
    return super.setMarkers(data, this.generatePopupContent);
  }

  generatePopupContent({ bcid, genus, species, locality, country }) {
    return (
      `<strong>GUID</strong>:  ${bcid}<br>` +
      `<strong>Genus</strong>:  ${genus}<br>` +
      `<strong>Species</strong>:  ${species}<br>` +
      `<strong>Locality, Country</strong>:  ${locality}, ${country}<br>` +
      `<a href='${this.$state.href('sample', {
        bcid,
      })}' target='_blank'>Sample details</a>`
    );
  }
}
