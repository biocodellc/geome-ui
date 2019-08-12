const getKey = key => event => ({ text: event[key] });

export const parentRecordDetails = {
  Event: {
    eventID: event => ({ text: event.eventID, href: `/record/${event.bcid}` }),
    yearCollected: getKey('yearCollected'),
    country: getKey('country'),
    decimalLatitude: getKey('decimalLatitude'),
    decimalLongitude: getKey('decimalLongitude'),
  },
  Sample: {
    materialSampleID: sample => ({
      text: sample.materialSampleID,
      href: `/record/${sample.bcid}`,
    }),
    genus: getKey('genus'),
    specificEpithet: getKey('specificEpithet'),
  },
  Tissue: {
    tissueID: tissue => ({
      text: tissue.tissueID,
      href: `/record/${tissue.bcid}`,
    }),
    tissuePlate: getKey('tissuePlate'),
    tissueWell: getKey('tissueWell'),
    // tissueType: getKey('tissueType'),
    // tissueInstitution: getKey('tissueInstitution'),
  },
};

export const childRecordDetails = {
  Sample: {
    materialSampleID: sample => ({
      text: sample.materialSampleID,
      href: `/record/${sample.bcid}`,
    }),
    genus: getKey('genus'),
    specificEpithet: getKey('specificEpithet'),
  },
  Diagnostics: {
    diagnosticID: record => ({
      text: record.diagnosticID,
      href: `/record/${record.bcid}`,
    }),
  },
  Tissue: {
    tissueID: tissue => ({
      text: tissue.tissueID,
      href: `/record/${tissue.bcid}`,
    }),
    // Here is a sample call to the tissuePlate Viewer, if we had a call...
    // Need to research how to make this call....
    // tissuePlate: tissue => ({
    // 	text: tissue.tissuePlate,
    //	href: `http://www.google.com`,
    //   }),
    tissuePlate: getKey('tissuePlate'),
    tissueWell: getKey('tissueWell'),
  },
  fastaSequence: {
    marker: sq => ({
      text: sq.marker,
      href: `/record/${sq.bcid}`,
    }),
  },
  fastqMetadata: {
    tissueID: m => ({
      text: m.tissueID,
      href: `/record/${m.bcid}`,
    }),
  },
  Sample_Photo: {
    photoID: p => ({
      text: p.photoID,
      href: `/record/${p.bcid}`,
    }),
    qualityScore: getKey('qualityScore'),
    hasScale: getKey('hasScale'),
  },
  Event_Photo: {
    photoID: p => ({
      text: p.photoID,
      href: `/record/${p.bcid}`,
    }),
    qualityScore: getKey('qualityScore'),
    hasScale: getKey('hasScale'),
  },
};

export const mainRecordDetails = {
  Event: {
    eventID: getKey('eventID'),
    yearCollected: getKey('yearCollected'),
    decimalLatitude: getKey('decimalLatitude'),
    decimalLongitude: getKey('decimalLongitude'),
    locality: getKey('locality'),
    bcid: e => ({
      text: e.bcid.match(/ark:\/.*/)[0],
      href: e.bcid,
    }),
  },
  // For photos, i'm putting some of the auxillary data in the main element, appears better
  Event_Photo: {
    materialSampleID: getKey('materialSampleID'),
    photoID: getKey('photoID'),
    photographer: getKey('photographer'),
    filename: getKey('filename'),
    originalUrl: getKey('originalUrl'),
    hasScale: getKey('hasScale'),
    qualityScore: getKey('qualityScore'),
    processed: getKey('processed'),
  },
  Sample_Photo: {
    materialSampleID: getKey('materialSampleID'),
    photoID: getKey('photoID'),
    photographer: getKey('photographer'),
    filename: getKey('filename'),
    originalUrl: getKey('originalUrl'),
    hasScale: getKey('hasScale'),
    qualityScore: getKey('qualityScore'),
    processed: getKey('processed'),
  },
  Sample: {
    materialSampleID: getKey('materialSampleID'),
    genus: getKey('genus'),
    specificEpithet: getKey('specificEpithet'),
    bcid: s => ({
      text: s.bcid.match(/ark:\/.*/)[0],
      href: s.bcid,
    }),
  },
  Diagnostics: {
    diagnosticID: getKey('diagnosticID'),
  },
  Tissue: {
    tissueID: getKey('tissueID'),
    tissueType: getKey('tissueType'),
    tissuePlate: getKey('tissuePlate'),
    tissueWell: getKey('tissueWell'),
    bcid: t => ({
      text: t.bcid.match(/ark:\/.*/)[0],
      href: t.bcid,
    }),
  },
  fastaSequence: {
    marker: getKey('marker'),
    // sequence: getKey('sequence'),
    bcid: s => ({
      text: s.bcid.match(/ark:\/.*/)[0],
      href: s.bcid,
    }),
  },
  fastqMetadata: {
    tissueID: getKey('tissueID'),
    bioSamplesLink: m => ({
      text: m.bioSample ? 'NCBI BioSamples' : undefined,
      href: m.bioSample
        ? `https://www.ncbi.nlm.nih.gov/biosample?LinkName=bioproject_biosample_all&from_uid=${
            m.bioSample.bioProjectId
          }`
        : undefined,
    }),
    bioProjectLink: m => ({
      text: m.bioSample ? 'NCBI BioProject' : undefined,
      href: m.bioSample
        ? `https://www.ncbi.nlm.nih.gov/bioproject/${m.bioSample.bioProjectId}`
        : undefined,
    }),
    bioSampleAccession: m => ({
      text: m.bioSample ? m.bioSample.accession : undefined,
    }),
    bcid: s => ({
      text: s.bcid.match(/ark:\/.*/)[0],
      href: s.bcid,
    }),
  },
};
