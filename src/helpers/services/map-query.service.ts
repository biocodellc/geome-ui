import { Injectable } from '@angular/core';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root',
})
export class MapQueryService extends MapService {
  constructor() {
    super();
  }

  private generateRecordLink(bcid: string): string {
    const url = document.location.origin + `/record/${bcid}`
    return url;
  }

  private eventPopup({
    bcid,
    locality,
    country,
    yearCollected,
  }: any): string {
    let loc = '';
    if (locality && country) loc = `<strong>Locality, Country</strong>: ${locality}, ${country}<br>`;
    else if (locality) loc = `<strong>Locality</strong>: ${locality}<br>`;
    else if (country) loc = `<strong>Country</strong>: ${country}<br>`;

    return `
      <strong>Year Collected</strong>: ${yearCollected}<br>
      ${loc}
      <a href='${this.generateRecordLink(bcid)}' target='_blank'>Event details</a>
    `;
  }

  private samplePopup({
    bcid,
    phylum,
    genus,
    specificEpithet,
    locality,
    country,
    yearCollected,
    eventBcid,
  }: any): string {
    let loc = locality && country
      ? `<strong>Locality, Country</strong>: ${locality}, ${country}<br>`
      : locality
      ? `<strong>Locality</strong>: ${locality}<br>`
      : country
      ? `<strong>Country</strong>: ${country}<br>`
      : '';

    return `
      <strong>Phylum</strong>: ${phylum}<br>
      <strong>Genus</strong>: ${genus || 'N/A'}<br>
      <strong>Specific Epithet</strong>: ${specificEpithet || 'N/A'}<br>
      <strong>Year Collected</strong>: ${yearCollected}<br>
      ${loc}
      <a href='${this.generateRecordLink(bcid)}' target='_blank'>Sample details</a><br>
      <a href='${this.generateRecordLink(eventBcid)}' target='_blank'>Event details</a>
    `;
  }

  private photoPopup({ bcid, img128 }: any): string {
    return `
      <a href='${this.generateRecordLink(bcid)}' target='_blank'>
        <img width="128" height="128" src='${img128}'>
      </a>
    `;
  }

  private diagnosticsPopup({
    bcid,
    materialSampleID,
    scientificName,
    measurementType,
    measurementValue,
    measurementUnit,
  }: any): string {
    return `
      <strong>Material Sample ID</strong>: ${materialSampleID}<br>
      <strong>Scientific Name</strong>: ${scientificName || 'N/A'}<br>
      <strong>Measurement Type</strong>: ${measurementType || 'N/A'}<br>
      <strong>Measurement Value</strong>: ${measurementValue || 'N/A'}<br>
      <strong>Measurement Unit</strong>: ${measurementUnit || 'N/A'}<br>
    `;
  }

  private tissuePopup({
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
  }: any): string {
    let loc = locality && country
      ? `<strong>Locality, Country</strong>: ${locality}, ${country}<br>`
      : locality
      ? `<strong>Locality</strong>: ${locality}<br>`
      : country
      ? `<strong>Country</strong>: ${country}<br>`
      : '';

    return `
      <strong>Tissue Type</strong>: ${tissueType || 'N/A'}<br>
      <strong>Tissue Plate</strong>: ${tissuePlate || 'N/A'}<br>
      <strong>Tissue Well</strong>: ${tissueWell || 'N/A'}<br>
      <strong>Specific Epithet</strong>: ${specificEpithet || 'N/A'}<br>
      <strong>Year Collected</strong>: ${yearCollected}<br>
      ${loc}
      <a href='${this.generateRecordLink(bcid)}' target='_blank'>Tissue details</a><br>
      <a href='${this.generateRecordLink(sampleBcid)}' target='_blank'>Sample details</a><br>
      <a href='${this.generateRecordLink(eventBcid)}' target='_blank'>Event details</a>
    `;
  }

  private extractionPopup({
    bcid,
    extractionID,
    extractionId,
    dnaExtractionID,
    extractionMethod,
    dnaExtractionMethod,
    extractionProtocol,
    extractionKit,
    extractionDate,
    dateExtracted,
    dateExtraction,
    extractor,
    extractedBy,
    performedBy,
    tissueBcid,
    sampleBcid,
    eventBcid,
  }: any): string {
    return `
      <strong>Extraction ID</strong>: ${extractionID || extractionId || dnaExtractionID || 'N/A'}<br>
      <strong>Extraction Method</strong>: ${extractionMethod || dnaExtractionMethod || 'N/A'}<br>
      <strong>Extraction Protocol</strong>: ${extractionProtocol || extractionKit || 'N/A'}<br>
      <strong>Extraction Date</strong>: ${extractionDate || dateExtracted || dateExtraction || 'N/A'}<br>
      <strong>Extractor</strong>: ${extractor || extractedBy || performedBy || 'N/A'}<br>
      <a href='${this.generateRecordLink(bcid)}' target='_blank'>Extraction details</a><br>
      <a href='${this.generateRecordLink(tissueBcid)}' target='_blank'>Tissue details</a><br>
      <a href='${this.generateRecordLink(sampleBcid)}' target='_blank'>Sample details</a><br>
      <a href='${this.generateRecordLink(eventBcid)}' target='_blank'>Event details</a>
    `;
  }

  private fastqPopup({
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
  }: any): string {
    let loc = locality && country
      ? `<strong>Locality, Country</strong>: ${locality}, ${country}<br>`
      : locality
      ? `<strong>Locality</strong>: ${locality}<br>`
      : country
      ? `<strong>Country</strong>: ${country}<br>`
      : '';

    return `
      <strong>SRA Accession #</strong>: ${bioSample?.accession || 'N/A'}<br>
      <strong>Library Layout</strong>: ${libraryLayout || 'N/A'}<br>
      <strong>Library Source</strong>: ${librarySource || 'N/A'}<br>
      <strong>Library Selection</strong>: ${librarySelection || 'N/A'}<br>
      <strong>Specific Epithet</strong>: ${specificEpithet || 'N/A'}<br>
      <strong>Year Collected</strong>: ${yearCollected}<br>
      ${loc}
      <a href='${this.generateRecordLink(bcid)}' target='_blank'>Fastq details</a><br>
      <a href='${this.generateRecordLink(tissueBcid)}' target='_blank'>Tissue details</a><br>
      <a href='${this.generateRecordLink(sampleBcid)}' target='_blank'>Sample details</a><br>
      <a href='${this.generateRecordLink(eventBcid)}' target='_blank'>Event details</a>
    `;
  }

  private POPUP_GENERATORS: { [key: string]: (data: any) => string } = {
    Event: this.eventPopup.bind(this),
    Sample: this.samplePopup.bind(this),
    Tissue: this.tissuePopup.bind(this),
    Extraction: this.extractionPopup.bind(this),
    Extraction_Details: this.extractionPopup.bind(this),
    fastqMetadata: this.fastqPopup.bind(this),
    Sample_Photo: this.photoPopup.bind(this),
    Event_Photo: this.photoPopup.bind(this),
    Diagnostics: this.diagnosticsPopup.bind(this),
  };

  setQueryMarkers(data: any[], entity: string) {
    const popupGenerator = this.POPUP_GENERATORS[entity] || (() => '');
    this.setMarkers(data, 'decimalLatitude', 'decimalLongitude', popupGenerator);
  }
}
