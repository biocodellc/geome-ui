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
  expedition: {
    projectTitle: p => ({
      text: p.projectTitle,
      href: `/workbench/project-overview/?projectId=${p.projectId}`,
    }),
    projectCode: getKey('projectCode'),
    projectId: getKey('projectId'),
    principalInvestigator: getKey('principalInvestigator'),
  },
  entityIdentifier: {
    expeditionId: getKey('expeditionId'),
    expeditionCode: getKey('expeditionCode'),
    expeditionTitle: getKey('expeditionTitle'),
    identifier: e => ({
      text: `https://n2t.net/${e.identifier}`,
      href: `https://n2t.net/${e.identifier}`,
    }),
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
  expedition: {
    identifier: e => ({
      text: `https://n2t.net/${e.identifier}`,
      href: `https://n2t.net/${e.identifier}`,
    }),
  },
  entityIdentifier: {
    query: e => ({
      text: `Query All ${e.expedition.expeditionTitle} ${e.conceptAlias}s`,
      queryLink: `query`,
    }),
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
      text: e.bcid,
      href: `https://n2t.net/${e.bcid}`,
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
      text: s.bcid,
      href: `https://n2t.net/${s.bcid}`,
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
      text: t.bcid,
      href: `https://n2t.net/${t.bcid}`,
    }),
  },
  fastaSequence: {
    marker: getKey('marker'),
    // sequence: getKey('sequence'),
    bcid: s => ({
      text: s.bcid,
      href: `https://n2t.net/${s.bcid}`,
    }),
  },
  fastqMetadata: {
    tissueID: getKey('tissueID'),
    bioSamplesLink: m => ({
      text: m.bioSample ? 'NCBI BioSample' : undefined,
      href: m.bioSample
        ? `https://www.ncbi.nlm.nih.gov/biosample/${m.bioSample.accession}`
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
      text: s.bcid,
      href: `https://n2t.net/${s.bcid}`,
    }),
  },
  expedition: {
    expeditionTitle: getKey('expeditionTitle'),
    expeditionCode: getKey('expeditionCode'),
    expeditionId: getKey('expeditionId'),
    created: getKey('created'),
    modified: getKey('modified'),
    identifier: e => ({
      text: e.identifier,
      href: `https://n2t.net/${e.identifier}`,
    }),
    metadata: getKey('metadata'),
  },
  entityIdentifier: {
    conceptAlias: getKey('conceptAlias'),
    identifier: e => ({
      text: e.identifier,
      href: `https://n2t.net/${e.identifier}`,
    }),
  },
};
