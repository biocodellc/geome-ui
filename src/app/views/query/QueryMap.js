import Map from '../../components/map/map';

function eventPopup({ bcid, locality, country, yearCollected }) {
  let loc = '';
  if (locality && country) {
    loc = `<strong>Locality, Country</strong>:  ${locality}, ${country}<br>`;
  } else if (locality) {
    loc = `<strong>Locality</strong>:  ${locality}<br>`;
  } else if (country) {
    loc = `<strong>Country</strong>:  ${country}<br>`;
  }
  return `${`<strong>Year Collected</strong>:  ${yearCollected}<br>`}${loc}<a href='${this.$state.href(
    'record',
    {
      bcid,
    },
  )}' target='_blank'>Event details</a>`;
}

function samplePopup({
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
      `<strong>Specific Epithet</strong>:  ${specificEpithet || 'N/A'}<br>` +
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

function photoPopup({
  bcid,
  img128,   
}) {      
  return (`${`<a href='${this.$state.href(
    'record',
    {
      bcid,
    },
  )}' target='_blank'><img width="128" height="128" src=${img128}></a>`}`) 
}
   

  function diagnosticsPopup({
    bcid,
    materialSampleID,
    scientificName,
    measurementType,
    measurementValue,
    measurementUnit   
  }) {    
    return (`${`<strong>materialSampleID</strong>  ${materialSampleID}</strong>}<br>` +
    `<strong>scientificName</strong> ${scientificName || 'N/A'}<br>` +
    `<strong>measurementType</strong> ${measurementType || 'N/A'}<br>` +
    `<strong>measurementValue</strong> ${measurementValue || 'N/A'}<br>` +
    `<strong>measurementUnit</strong> ${measurementUnit || 'N/A'}<br>`}`);    
  }

function tissuePopup({
  bcid,
  tissueType,
  tissuePlate,
  tissueWell,
  specificEpithet,
  locality,
  country,
  yearCollected,
  sampleBcid,
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
    `${`<strong>Tissue Type</strong>:  ${tissueType || 'N/A'}<br>` +
      `<strong>Tissue Plate</strong>:  ${tissuePlate || 'N/A'}<br>` +
      `<strong>Tissue Well</strong>:  ${tissueWell || 'N/A'}<br>` +
      `<strong>Specific Epithet</strong>:  ${specificEpithet || 'N/A'}<br>` +
      `<strong>Year Collected</strong>:  ${yearCollected}<br>`}${loc}<a href='${this.$state.href(
      'record',
      {
        bcid,
      },
    )}' target='_blank'>Tissue details</a><br>` +
    `<a href='${this.$state.href('record', {
      bcid: sampleBcid,
    })}' target='_blank'>Sample details</a><br>` +
    `<a href='${this.$state.href('record', {
      bcid: eventBcid,
    })}' target='_blank'>Event details</a>`
  );
}

function fastqPopup({
  bcid,
  libraryLayout,
  librarySelection,
  librarySource,
  bioSample,
  specificEpithet,
  locality,
  country,
  yearCollected,
  sampleBcid,
  eventBcid,
  tissueBcid,
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
    `${`<strong>SRA Accession #</strong>:  ${(bioSample &&
      bioSample.accession) ||
      'N/A'}<br>` +
      `<strong>Library Layout</strong>:  ${libraryLayout || 'N/A'}<br>` +
      `<strong>Library Source</strong>:  ${librarySource || 'N/A'}<br>` +
      `<strong>Library Selection</strong>:  ${librarySelection || 'N/A'}<br>` +
      `<strong>Specific Epithet</strong>:  ${specificEpithet || 'N/A'}<br>` +
      `<strong>Year Collected</strong>:  ${yearCollected}<br>`}${loc}<a href='${this.$state.href(
      'record',
      {
        bcid,
      },
    )}' target='_blank'>Fastq details</a><br>` +
    `<a href='${this.$state.href('record', {
      bcid: tissueBcid,
    })}' target='_blank'>Tissue details</a><br>` +
    `<a href='${this.$state.href('record', {
      bcid: sampleBcid,
    })}' target='_blank'>Sample details</a><br>` +
    `<a href='${this.$state.href('record', {
      bcid: eventBcid,
    })}' target='_blank'>Event details</a>`
  );
}

const POPUP_GENERATORS = {
  Event: eventPopup,
  Sample: samplePopup,
  Tissue: tissuePopup,
  fastqMetadata: fastqPopup,
  Sample_Photo: photoPopup,
  Event_Photo: photoPopup,
  Diagnostics: diagnosticsPopup
};

export default class QueryMap extends Map {
  constructor($state, latColumn, lngColumn) {
    super(latColumn, lngColumn);
    this.$state = $state;
  }

  setMarkers(data, entity) {
    const fn = POPUP_GENERATORS[entity] || function() {};
    return super.setMarkers(data, fn.bind(this));
  }
}
