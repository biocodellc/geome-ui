export type FaqBlock =
  | { type: 'paragraph' | 'note' | 'example'; text: string }
  | { type: 'bullets' | 'steps'; items: string[] };

export interface FaqItem {
  id: string;
  question: string;
  blocks: FaqBlock[];
}

export interface FaqSection {
  id: string;
  title: string;
  description: string;
  items: FaqItem[];
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started Questions',
    description:
      'These entries are pulled from Part 4 of the current GEOME help documentation and reformatted for in-app browsing.',
    items: [
      {
        id: 'what-is-geome',
        question: 'What is GEOME?',
        blocks: [
          {
            type: 'paragraph',
            text: 'GEOME, the Genomic Observatories Metadatabase, is a web-based system for capturing and managing metadata for biological samples and related sequence-linked records.',
          },
          {
            type: 'example',
            text: 'GEOME is available at www.geome-db.org.',
          },
        ],
      },
      {
        id: 'easier-accessioning',
        question:
          'How can I make accessioning my data easier in future uploads to GEOME?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Use the GEOME metadata template as the working spreadsheet during field and lab work. You can customize order and add local fields, but required GEOME columns should remain intact and populated.',
          },
          {
            type: 'steps',
            items: [
              'Save the file either as an Excel workbook (`.xlsx`) using the GEOME worksheet structure, or as a CSV with a single header row.',
              'During upload, choose the matching file format option in GEOME.',
            ],
          },
        ],
      },
      {
        id: 'dataset-accessibility',
        question:
          'When I publish data uploaded to GEOME for the first time, what do I report about dataset accessibility in my publication?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Include the expedition or dataset GUID in the data accessibility section of your publication. That GUID is the persistent identifier for the metadata and should be cited when the dataset is first published and whenever it is reused.',
          },
          {
            type: 'steps',
            items: [
              'Open Workbench and go to your expeditions.',
              'Locate the dataset you published.',
              'Use the value shown as the expedition identifier / GUID.',
            ],
          },
        ],
      },
      {
        id: 'cite-geome',
        question: 'How do I cite, or acknowledge use of GEOME?',
        blocks: [
          {
            type: 'paragraph',
            text: 'If you use GEOME for storage, access, or publication, cite the original GEOME publication by Deck et al. (2017) describing the platform and its role in linking metadata to genetic samples.',
          },
          {
            type: 'note',
            text: 'Including the GEOME citation helps support ongoing maintenance and development of the platform.',
          },
        ],
      },
      {
        id: 'reference-dataset',
        question:
          'How do I reference the dataset in my project or team, in GEOME?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Reference datasets using their expedition GUIDs. For a single dataset, find the expedition identifier in Workbench. For a project containing multiple datasets, use the GUID shown beside each expedition in Project Overview.',
          },
          {
            type: 'example',
            text: 'Example expedition GUID format: https://n2t.net/ark:/21547/CXt2',
          },
        ],
      },
      {
        id: 'access-uploaded-metadata',
        question:
          'How do I access my project or sample metadata once uploaded to GEOME?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Uploaded metadata is available through GEOME Query. You can search by geography, expedition name, taxonomy, and other uploaded fields. Each expedition has a GUID, and each sample gets its own resolvable BCID.',
          },
          {
            type: 'steps',
            items: [
              'Use Query to find the records you need.',
              'Use Workbench > Expeditions or Project Overview to find expedition GUIDs.',
              'Use individual BCIDs when referencing specific samples or records.',
            ],
          },
        ],
      },
      {
        id: 'download-genetic-data',
        question:
          'Why can\'t I download all the genetic data for the query I made in GEOME?',
        blocks: [
          {
            type: 'paragraph',
            text: 'GEOME primarily stores metadata, not all underlying sequence files. Query results return metadata and linked accession numbers, while the actual reads or sequences are usually retrieved from external repositories such as NCBI/GenBank.',
          },
          {
            type: 'bullets',
            items: [
              'Use the accession numbers in the GEOME metadata to retrieve records from NCBI/GenBank.',
              'Some FASTA data may also be available directly in GEOME if the contributor uploaded it.',
            ],
          },
        ],
      },
      {
        id: 'advantages-of-geome',
        question: 'What are the advantages of depositing metadata in GEOME?',
        blocks: [
          {
            type: 'bullets',
            items: [
              'It streamlines SRA-linked metadata submission workflows.',
              'It supports FAIR data practices by keeping metadata findable and reusable.',
              'It works well for collaborative projects with shared templates and controlled access.',
              'It makes batch retrieval of linked sequence data easier through shared identifiers and accessions.',
            ],
          },
        ],
      },
      {
        id: 'derived-data',
        question: 'What is derived data?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Derived data is data generated by analysis or bioinformatic processing from raw genomic reads. Examples include SNP datasets, VCFs, Genepop files, Structure files, microsatellite outputs, and related processed datasets.',
          },
          {
            type: 'paragraph',
            text: 'GEOME is especially interested in stable URLs for externally hosted derived datasets so they can be linked back to metadata records.',
          },
        ],
      },
      {
        id: 'learn-more',
        question:
          'How do I find out more about these metadata initiatives and contribute?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Review the published GEOME papers, browse the application itself, and contact the GEOME team with feedback. Promoting use of GEOME in your lab, projects, and publications also helps expand the community and improve metadata-sharing practices.',
          },
        ],
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical Questions',
    description:
      'Operational questions about updating records, deleting data, reload behavior, and photo management.',
    items: [
      {
        id: 'update-multiple-expeditions',
        question: 'How can I update multiple expeditions at once?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Use the Project CSV Archive workflow. Download the project archive, edit the relevant CSVs locally, then upload the modified entity files back through Load Data using the Multiple Expeditions option.',
          },
          {
            type: 'bullets',
            items: [
              'Keep a backup of the original archive before editing.',
              'Do not remove the columns used for record mapping, especially `bcid`, `expeditionCode`, and `projectId`.',
              'During upload, select the entities you changed and choose `Multiple Expeditions` in the expedition selector.',
            ],
          },
        ],
      },
      {
        id: 'uri-materialsampleid',
        question: 'Using a pre-existing materialSampleID formed as a URI',
        blocks: [
          {
            type: 'paragraph',
            text: 'GEOME restricts the characters allowed in `materialSampleID`, so a full URI usually will not validate as the field value. Preserve the original URI in `voucherURI`, then use a GEOME-compatible suffix or new ID as the `materialSampleID`.',
          },
          {
            type: 'note',
            text: 'Slashes and dashes that are common in URIs are not accepted in `materialSampleID`.',
          },
        ],
      },
      {
        id: 'delete-metadata-record',
        question: 'How do I delete an existing metadata record in GEOME?',
        blocks: [
          {
            type: 'paragraph',
            text: 'The standard workflow is to download the expedition data, remove the row or rows you want deleted, then upload the revised file back to the same expedition with `Replace expedition data` enabled.',
          },
          {
            type: 'steps',
            items: [
              'Download the expedition dataset.',
              'Delete the row or rows locally.',
              'Go to Load Data and upload the revised file.',
              'Check `Replace expedition data` before submitting.',
            ],
          },
        ],
      },
      {
        id: 'replace-expedition-data',
        question:
          'How do I update data, and what does the "Replace Expedition Data" box mean?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Download the current expedition data, make edits in that file, and upload it back to the same expedition. Leave `Replace expedition data` unchecked when you are only adding or updating records. Check it when you need records removed from the expedition.',
          },
          {
            type: 'note',
            text: 'When using replace/reload, keep the original columns from the downloaded file so GEOME can map and validate records correctly.',
          },
        ],
      },
      {
        id: 'delimited-lists',
        question:
          'What do "concatenated and separated" and "delimited list" mean?',
        blocks: [
          {
            type: 'paragraph',
            text: 'For metadata fields that accept multiple values in one cell, GEOME expects the values to be separated with a pipe character (`|`). This allows the system to split them back into separate values.',
          },
          {
            type: 'example',
            text: 'Example: `Charles Darwin | Alfred Wallace`',
          },
          {
            type: 'paragraph',
            text: 'For most multi-valued fields, pipe-delimited entries are appropriate. Derived dataset fields are different: each additional derived dataset should usually be represented by duplicating the row and changing only the derived-data fields.',
          },
        ],
      },
      {
        id: 'sensitive-locations',
        question:
          'My samples are from a market, or I need to protect an exact collection location. How can I still contribute spatial metadata?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Provide approximate coordinates instead of precise ones, and use `coordinateUncertaintyInMeters` to reflect the reduced spatial precision. For market or otherwise sensitive localities, GEOME recommends using an uncertainty value that makes the reduced precision explicit.',
          },
          {
            type: 'bullets',
            items: [
              'Use the market or approximate locality as the reported point if exact origin is unknown.',
              'Round coordinates when needed.',
              'Set `coordinateUncertaintyInMeters` high enough to reflect the true uncertainty.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'photos',
    title: 'Photos',
    description:
      'Photo upload, replacement, and deletion guidance pulled together in one place.',
    items: [
      {
        id: 'upload-online-photos',
        question: 'How do I upload photos that are already online?',
        blocks: [
          {
            type: 'paragraph',
            text: 'If your images are already hosted somewhere online, upload a photo metadata CSV through Load Data using the relevant photo worksheet or CSV type. The file should tell GEOME where the images live and how they map to parent records.',
          },
          {
            type: 'bullets',
            items: [
              'Include `originalUrl` for the image location GEOME should fetch.',
              'Include `photoID` when possible so later updates can target the same photo record cleanly.',
              'Include `expeditionCode` when the upload spans multiple expeditions.',
            ],
          },
        ],
      },
      {
        id: 'upload-local-photos',
        question: 'How do I upload photos from my computer?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Use the photo uploader with a zip archive of images. You can either rely on the file naming convention `<parentIdentifier>+<photoID>.<ext>` or include a `metadata.csv` in the archive that maps each file to its parent record.',
          },
          {
            type: 'bullets',
            items: [
              'Supported bulk-upload workflows are described on the Upload Photos page in Workbench.',
              'The archive can include a `metadata.csv` file with parent identifiers, file names, and related metadata.',
              'Processed thumbnails and display sizes may take time to appear after upload.',
            ],
          },
        ],
      },
      {
        id: 'photo-original-url-and-deletion',
        question:
          'If photos were uploaded with the photo uploader and I later add `originalUrl` values in the exported spreadsheet, will GEOME avoid generating a new set of processed images? How can I delete bad photos?',
        blocks: [
          {
            type: 'paragraph',
            text: 'No, not in the normal bulk-upload case. If a photo originally came in through the zip uploader, GEOME processes it from an internal `bulkLoadFile`. Later filling in a new `originalUrl` counts as a changed source and will trigger reprocessing rather than reusing the existing processed derivatives.',
          },
          {
            type: 'paragraph',
            text: 'GEOME only reuses existing processed image URLs when the incoming row has the same stored `originalUrl` as an already-processed photo record.',
          },
          {
            type: 'paragraph',
            text: 'There is currently no photo-specific delete control exposed in the UI. To remove bad photos, reload the photo worksheet or photo CSV (`sample_photos` / `event_photos`) with `Replace expedition data` checked and leave out the photo rows you want removed.',
          },
          {
            type: 'paragraph',
            text: 'Deleting the entire expedition will also remove the associated photos. Replacing an expedition workbook only removes photos if the replacement upload includes the photo worksheet itself. If the photo worksheet is not part of that replacement upload, the photos remain.',
          },
        ],
      },
    ],
  },
  {
    id: 'sequence-data',
    title: 'Working With Sequence Data',
    description:
      'Guidance for linking GEOME metadata to sequence repositories, derived datasets, and specialized study designs.',
    items: [
      {
        id: 'replace-sequence-data',
        question:
          'Is there a quick way to replace project sequence data that is similar to the metadata replace function?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Yes. For FASTA-backed sequence data, upload a new FASTA file through Load Data using the same tissue identifiers and marker. GEOME will treat that upload as the replacement for the existing sequence data for that marker.',
          },
        ],
      },
      {
        id: 'link-existing-sra',
        question:
          'How can I upload metadata and link to genetic data that are already in the SRA?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Use a template that includes the Tissue entity, add `bioSampleAccession` values to the tissue records, and make sure each accession is matched to the correct `tissueID`. Uploading that metadata allows GEOME to link the metadata to existing SRA records.',
          },
        ],
      },
      {
        id: 'find-sra-specific-info',
        question:
          'How do I find SRA-specific information, such as library strategy, sequencing platform, or read type?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Use the NCBI metadata attached to the SRA records. The help documentation specifically points users to the `rentrez` R package for programmatic access to these details.',
          },
        ],
      },
      {
        id: 'cite-sample-metadata-and-genetic-data',
        question:
          'How do I refer to and cite sample metadata and related genetic data that I retrieved through GEOME?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Cite individual GEOME records using their ARK identifiers through the `n2t.net` resolver. Cite the linked genetic data using the accession identifiers from the external repository, such as NCBI BioSample or SRA.',
          },
          {
            type: 'example',
            text: 'Example GEOME record URL: https://n2t.net/ark:/21547/CVJ2BMOO_00004',
          },
        ],
      },
      {
        id: 'genbank-existing-data',
        question: 'What if my genetic data is already on NCBI/GenBank?',
        blocks: [
          {
            type: 'paragraph',
            text: 'You can still connect those records to GEOME by placing the appropriate accessions in the metadata template. Use `associatedSequences` for nucleotide accessions, and use `biosampleAccession` on tissue records for SRA-linked data.',
          },
          {
            type: 'note',
            text: 'If you want SRA records to point back to GEOME cleanly, the recommended order is still GEOME metadata first, then FASTQ submission through GEOME into SRA.',
          },
        ],
      },
      {
        id: 'submit-sequences-to-geome',
        question:
          'Can I submit my sequences to GEOME instead of NCBI/GenBank?',
        blocks: [
          {
            type: 'paragraph',
            text: 'No. GEOME is not a primary sequence repository. It complements repositories like NCBI/GenBank by managing and linking metadata, while the sequence repositories remain the authoritative home for raw sequence data.',
          },
          {
            type: 'note',
            text: 'GEOME does not accept FASTQ as a final repository destination; it provides tooling to help prepare SRA submissions.',
          },
        ],
      },
      {
        id: 'snp-vs-raw-reads',
        question:
          'Do I upload my SNP genotypes, or the raw reads I used to get the SNP data?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Upload the raw reads. GEOME recommends preserving the unfiltered sequence data in SRA so future users can reprocess the data without being locked into one set of SNP calling or filtering decisions.',
          },
          {
            type: 'paragraph',
            text: 'If you also want to share derived SNP or genotype products, store them in a permanent repository such as Dryad or Zenodo and link them back through GEOME derived-data fields.',
          },
        ],
      },
      {
        id: 'microsatellites',
        question: 'What if my genetic data is for microsatellites?',
        blocks: [
          {
            type: 'paragraph',
            text: 'There is no single standard repository for microsatellite genotype datasets, but GEOME can still link them. Deposit the data in a permanent open repository such as Dryad or Zenodo and connect the external dataset back to the metadata using derived-data fields.',
          },
        ],
      },
      {
        id: 'community-edna',
        question:
          'My genetic data is for a community or environmental sample (for example metagenomics, metabarcoding, or eDNA). How can I upload this to GEOME?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Represent the environmental or community sample as the `materialSampleID`, set metadata such as `basisOfRecord`, `environmentalMedium`, and `samplingProtocol` to reflect the sample context, then use the FASTQ workflow for the linked sequence submission.',
          },
        ],
      },
      {
        id: 'host-symbiont-systems',
        question:
          'My research is focused on host-symbiont, host-microbiome, host-parasite, or similar linked systems. How can I link the metadata for both biological entities?',
        blocks: [
          {
            type: 'paragraph',
            text: 'GEOME supports two common patterns: one shared `materialSampleID` with distinct tissues for the linked organisms, or two separate `materialSampleID`s tied together through cross-reference fields such as `associatedOrganisms`.',
          },
          {
            type: 'bullets',
            items: [
              'Use one shared sample when the host and partner are effectively one collected unit.',
              'Use separate sample IDs when you need independent taxonomy, metadata tracking, and analysis for each organism.',
            ],
          },
        ],
      },
      {
        id: 'unpublished-genetic-data',
        question:
          'What if I have not published the genetic data yet, and it is not on NCBI/GenBank?',
        blocks: [
          {
            type: 'paragraph',
            text: 'You can still upload the metadata to GEOME early. This helps validate the dataset and prepares it for later sequence submission. Projects can remain private while a manuscript is in progress, and discoverability can be adjusted in project settings.',
          },
        ],
      },
      {
        id: 'shareable-tissue-no-genetic-data',
        question:
          'What if I have a tissue sample I am willing to share, but I do not have genetic data attached to it yet?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Upload the metadata anyway and populate the Tissue entity. The documentation recommends using `tissueRemarks` to indicate availability when the physical sample exists and can be shared on request.',
          },
        ],
      },
      {
        id: 'no-tissue-left',
        question:
          'What if I no longer have any sample or tissue corresponding to that genetic data?',
        blocks: [
          {
            type: 'paragraph',
            text: 'GEOME still encourages uploading the collection and sample metadata so the genetic data remains properly contextualized. The documentation recommends marking `tissueRemarks` to indicate that the tissue is unavailable.',
          },
        ],
      },
      {
        id: 'pooled-radseq',
        question: 'How do I represent pooled RADSeq data?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Set `individualCount` to the number of individuals represented by the pooled sample. If the pooled individuals span a spatial range, use `coordinateUncertaintyInMeters` to describe the collection uncertainty appropriately.',
          },
        ],
      },
    ],
  },
];
