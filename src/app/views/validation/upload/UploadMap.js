import Map from '../../../components/map/map';

// TODO finish this
export default class UploadMap extends Map {
  constructor(config, entity) {
    // super(latColumn, lngColumn);
    // this.$state = $state;
  }

  generatePopupContent({ bcid, genus, species, locality, country }) {
    return (
      `<strong>GUID</strong>:  ${bcid}<br>` +
      `<strong>Genus</strong>:  ${genus}<br>` +
      `<strong>Species</strong>:  ${species}<br>` +
      `<strong>Locality, Country</strong>:  ${locality}, ${country}<br>` +
      `<a href='${this.$state.href('sample', {
        entity: 'Resource', // TODO don't hardcode this
        bcid,
      })}' target='_blank'>Sample details</a>`
    );
  }
}
