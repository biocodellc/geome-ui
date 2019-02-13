import Map from '../../components/map/map';

export default class QueryMap extends Map {
  constructor($state, latColumn, lngColumn) {
    super(latColumn, lngColumn);
    this.$state = $state;
  }

  setMarkers(data) {
    return super.setMarkers(data, this.generatePopupContent.bind(this));
  }

  generatePopupContent({
    bcid,
    phylum,
    genus,
    specificEpithet,
    locality,
    country,
    yearCollected,
    eventBcid,
  }) {
    let loc = '';
    if (locality && country) {
      loc = `<strong>Locality, Country</strong>:  ${locality}, ${country}<br>`;
    } else if (locality) {
      loc = `<strong>Locality</strong>:  ${locality}<br>`;
    } else if (country) {
      loc = `<strong>Country</strong>:  ${country}<br>`;
    }
    return (
      `${`<strong>Phylum</strong>:  ${phylum}<br>` +
        `<strong>Genus</strong>:  ${genus || 'N/A'}<br>` +
        `<strong>specificEpithet</strong>:  ${specificEpithet || 'N/A'}<br>` +
        `<strong>Year Collected</strong>:  ${yearCollected}<br>`}${loc}<a href='${this.$state.href(
        'record',
        {
          bcid,
        },
      )}' target='_blank'>Sample details</a><br>` +
      `<a href='${this.$state.href('record', {
        bcid: eventBcid,
      })}' target='_blank'>Event details</a>`
    );
  }
}
