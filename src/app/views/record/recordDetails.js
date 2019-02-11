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
    //tissueType: getKey('tissueType'),
    //tissueInstitution: getKey('tissueInstitution'),
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
  Tissue: {
    tissueID: tissue => ({
      text: tissue.tissueID,
      href: `/record/${tissue.bcid}`,
    }),
    // Here is a sample call to the tissuePlate Viewer, if we had a call...
    // Need to research how to make this call....
    //tissuePlate: tissue => ({
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
    materialSampleID: m => ({
      text: m.materialSampleID,
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
      text: e.bcid,
      href: `https://n2t.net/${e.bcid}`,
    }),
  },
  // For photos, i'm putting some of the auxillary data in the main element, appears better
  Event_Photo: {
    materialSampleID: getKey('materialSampleID'),
    photoID: getKey('photoID'),
    originalUrl: getKey('originalUrl'),
    original: getKey('photoID'),
    img1024: Sample_Photo => ({
    	text: '1024 pixel wide image',
	href: `${Event_Photo.img1024}`
    }),
    img512: Sample_Photo => ({
    	text: '512 pixel wide image',
	href: `${Event_Photo.img512}`
    }),
    img128: Sample_Photo => ({
    	text: '128 pixel wide image',
	href: `${Event_Photo.img128}`
    }),
    expeditionCode: Sample_Photo => ({
   	text: `${Event_Photo.expeditionCode}`,
        href: `/query?q=_projects_:${Event_Photo.projectId} and _expeditions_:${Event_Photo.expeditionCode}`
    }),
    processed: getKey('processed'),
  },
  Sample_Photo: {
    materialSampleID: getKey('materialSampleID'),
    photoID: getKey('photoID'),
    originalUrl: getKey('originalUrl'),
    img1024: Sample_Photo => ({
    	text: '1024 pixel wide image',
	href: `${Sample_Photo.img1024}`
    }),
    img512: Sample_Photo => ({
    	text: '512 pixel wide image',
	href: `${Sample_Photo.img512}`
    }),
    img128: Sample_Photo => ({
    	text: '128 pixel wide image',
	href: `${Sample_Photo.img128}`
    }),
    expeditionCode: Sample_Photo => ({
   	text: `${Sample_Photo.expeditionCode}`,
        href: `/query?q=_projects_:${Sample_Photo.projectId} and _expeditions_:${Sample_Photo.expeditionCode}`
    }),
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
    sequence: getKey('sequence'),
    bcid: s => ({
      text: s.bcid,
      href: `https://n2t.net/${s.bcid}`,
    }),
  },
  fastqMetadata: {
    materialSampleID: getKey('materialSampleID'),
    bioSamplesLink: m => ({
      text: m.bioSample ? 'NCBI BioSamples' : undefined,
      href: m.bioSample
        ? `https://www.ncbi.nlm.nih.gov/bioproject/${m.bioSample.bioProjectId}`
        : undefined,
    }),
    bioProjectLink: m => ({
      text: m.bioSample ? 'NCBI BioProject' : undefined,
      href: m.bioSample
        ? `https://www.ncbi.nlm.nih.gov/biosample?LinkName=bioproject_biosample_all&from_uid=${
            m.bioSample.bioProjectId
          }`
        : undefined,
    }),
    bcid: s => ({
      text: s.bcid,
      href: `https://n2t.net/${s.bcid}`,
    }),
  },
};
