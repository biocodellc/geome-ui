const getKey = (key:any) => (event:any) => ({ text: event[key] });

export const parentRecordDetails:any = {
  Event: {
    eventID: (event:any) => ({ text: event.eventID, href: `/record/${event.bcid}` }),
    yearCollected: getKey('yearCollected'),
    country: getKey('country'),
    decimalLatitude: getKey('decimalLatitude'),
    decimalLongitude: getKey('decimalLongitude'),
  },
  Sample: {
    materialSampleID: (sample:any) => ({
      text: sample.materialSampleID,
      href: `/record/${sample.bcid}`,
    }),
    scientificName: getKey('scientificName'),
    lowestTaxonRank: getKey('lowestTaxonRank'),
    catalogNumber: getKey('catalogNumber'),
  },
  Tissue: {
    tissueID: (tissue:any) => ({
      text: tissue.tissueID,
      href: `/record/${tissue.bcid}`,
    }),
    tissuePlate: getKey('tissuePlate'),
    tissueWell: getKey('tissueWell'),
    fromTissue: getKey('fromTissue'),
    tissueInstitution: getKey('tissueInstitution'),
    tissueType: getKey('tissueType'),
    // tissueInstitution: getKey('tissueInstitution'),
  },
  expedition: {
    projectTitle: (p:any) => ({
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
    identifier: (e:any) => ({
      text: `https://n2t.net/${e.identifier}`,
      href: `https://n2t.net/${e.identifier}`,
    }),
  },
};

export const childRecordDetails:any = {
  Sample: {
    materialSampleID: (sample:any) => ({
      text: sample.materialSampleID,
      href: `/record/${sample.bcid}`,
    }),
    scientificName: getKey('scientificName'),
    lowestTaxonRank: getKey('lowestTaxonRank'),
    catalogNumber: getKey('catalogNumber'),
  },
  Diagnostics: {
    diagnosticID: (record:any) => ({
      text: record.diagnosticID,
      href: `/record/${record.bcid}`,
    }),
  },
  Tissue: {
    tissueID: (tissue:any) => ({
      text: tissue.tissueID,
      href: `/record/${tissue.bcid}`,
    }),
    // Here is a sample call to the tissuePlate Viewer, if we had a call...
    // Need to research how to make this call....
    // tissuePlate: tissue:any) => ({
    // 	text: tissue.tissuePlate,
    //	href: `http://www.google.com`,
    //   }),
    tissuePlate: getKey('tissuePlate'),
    tissueWell: getKey('tissueWell'),
    fromTissue: getKey('fromTissue'),
    tissueInstitution: getKey('tissueInstitution'),
    tissueType: getKey('tissueType'),
  },
  fastaSequence: {
    marker: (sq:any) => ({
      text: sq.marker,
      href: `/record/${sq.bcid}`,
    }),
  },
  fastqMetadata: {
    tissueID: (m:any) => ({
      text: m.tissueID,
      href: `/record/${m.bcid}`,
    }),
  },
  Sample_Photo: {
    photoID: (p:any) => ({
      text: p.photoID,
      href: `/record/${p.bcid}`,
    }),
    qualityScore: getKey('qualityScore'),
    hasScale: getKey('hasScale'),
  },
  Event_Photo: {
    photoID: (p:any) => ({
      text: p.photoID,
      href: `/record/${p.bcid}`,
    }),
    qualityScore: getKey('qualityScore'),
    hasScale: getKey('hasScale'),
  },
  expedition: {
    identifier: (e:any) => ({
      text: `https://n2t.net/${e.identifier}`,
      href: `https://n2t.net/${e.identifier}`,
    }),
  },
  entityIdentifier: {
    query: (e:any) => ({
      text: `Query All ${e.expedition.expeditionTitle} ${e.conceptAlias}s`,
      href: `query/?q=_expeditions_:[${e.expedition.expeditionCode}]&entity=${e.conceptAlias}`,
      //queryLink: `query`,
    }),
  },
};

export const mainRecordDetails:any = {
  Event: {
    eventID: getKey('eventID'),
    yearCollected: getKey('yearCollected'),
    decimalLatitude: getKey('decimalLatitude'),
    decimalLongitude: getKey('decimalLongitude'),
    locality: getKey('locality'),
    bcid: (e:any) => ({
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
    bcid: (s:any) => ({
      text: s.bcid,
      href: `https://n2t.net/${s.bcid}`,
    }),
  },
  Diagnostics: {
    diagnosticID: getKey('diagnosticID'),
    measurementType: getKey('measurementType'),
    derivedDataType: getKey('derivedDataType'),
    derivedDataFormat: getKey('derivedDataFormat'),
    derivedDataURI: getKey('derivedDataURI'),
    derivedDataFilename: getKey('derivedDataFilename')
  },
  Tissue: {
    tissueID: getKey('tissueID'),
    tissueType: getKey('tissueType'),
    tissuePlate: getKey('tissuePlate'),
    tissueWell: getKey('tissueWell'),
    bcid: (t:any) => ({
      text: t.bcid,
      href: `https://n2t.net/${t.bcid}`,
    }),
    biosampleAccession: (m:any) => ({
      text: m.biosampleAccession? '$m.biosampleAccession' : undefined,
      href: `https://www.ncbi.nlm.nih.gov/biosample/?term=${m.biosampleAccession}/`,
    }),
  },
  fastaSequence: {
    marker: getKey('marker'),
    // sequence: getKey('sequence'),
    bcid: (s:any) => ({
      text: s.bcid,
      href: `https://n2t.net/${s.bcid}`,
    }),
  },
  fastqMetadata: {
    tissueID: getKey('tissueID'),
    bioSamplesLink: (m:any) => ({
      text: m.bioSample ? 'NCBI BioSample' : undefined,
      href: m.bioSample
        ? `https://www.ncbi.nlm.nih.gov/biosample/${m.bioSample.accession}`
        : undefined,
    }),
    bioProjectLink: (m:any) => ({
      text: m.bioSample ? 'NCBI BioProject' : undefined,
      href: m.bioSample
        ? `https://www.ncbi.nlm.nih.gov/bioproject/${m.bioSample.bioProjectId}`
        : undefined,
    }),
    bioSampleAccession: (m:any) => ({
      text: m.bioSample ? m.bioSample.accession : undefined,
    }),
    bcid: (s:any) => ({
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
    identifier: (e:any) => ({
      text: e.identifier,
      href: `https://n2t.net/${e.identifier}`,
    }),
    metadata: getKey('metadata'),
  },
  entityIdentifier: {
    conceptAlias: getKey('conceptAlias'),
    identifier: (e:any) => ({
      text: e.identifier,
      href: `https://n2t.net/${e.identifier}`,
    }),
  },
};