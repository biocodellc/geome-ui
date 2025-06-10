import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DummyDataService {

  loadingState:BehaviorSubject<boolean> = new BehaviorSubject(false);
  toggleSidebarSub:BehaviorSubject<boolean> = new BehaviorSubject(false);

  getHomePageItems(): Array<any> {
    return [
      { img: 'images/about7.png', title: 'Documentation', disc: 'GEOME Documentation', route: '/about' },
      { img: 'images/new_search.png', title: 'Query', disc: 'Search and download sequence files and associated metadata', route: '/query' },
      { img: 'images/workbench.png', title: 'Workbench', disc: 'View and manage project specific data', route: '/workbench' },
    ];
  }

  getAboutFirstSectionData(): Array<any> {
    return [
      { type: 'container', title: '', disc: 'Read this section carefully in order to understand how teams, projects, and expeditions work in the GEOME environment. If a project administrator has invited you to join an existing project, there is no need for you to create a new project. If this is the case, you may skip to the heading below titled "Expeditions".', img: 'images/expeditionProjectTeamGraphic.png', imgLabel: 'About Teams and Projects' },
      { type: 'container', title: 'TEAM Projects', disc: 'A team is a specialized research group with settings relevant to members of that group. If you are not part of one of the teams, then proceed to the next-section, "Non-Team Projects". Teams enable users to create projects having a common set of rules, attributes, and controlled vocabulary terms. Join a team workspace if you have been invited to do so and if you agree to use ALL of the attributes, rules, and controlled vocabularies for that team. The team administrator controls all configuration options. To create a project within a team workspace, select "Join team workspace" during the project creation process and then select the appropriate team:', img: 'images/screenshotNewTeamProject.png', imgLabel: 'Screenshot of project creation wizard, creating a team project. You will need to select a suitable team in the dropdown box labelled "Existing Team Workspace".' },
      { type: '', disc: 'The following public team workspaces are available in GEOME and will appear in the dropdown entitled "Existing Team Workspace":' },
      { type: 'container', title: 'NON-TEAM Projects', disc: 'If a project is not created as part of a team, the project owner may configure available attributes, rules, or controlled vocabularies during project creation, or later by visiting the “project configuration” option in the workbench.', img: 'images/screenshotNonTeamProject.png', imgLabel: 'Screenshot of project creation wizard, creating a non-team project. Note the "Join a team workspace" slider is greyed out.' },
      { type: 'container', title: '', disc: 'After pressing "Next" (see screenshot above), you will have the choice to either create a single sheet project or a multiple sheet project.', img: 'images/screenshotChooseConfig.png', imgLabel: 'Screenshot of project creation wizard, "Project Configuration" section.' },
      { type: 'container', title: '', disc: 'A single sheet project is conceptually simpler to implement as all event, sample, and tissue metadata is entered onto a single sheet. The advantage of a multiple worksheet project is that you reduce duplicate data entry for "parent" entities (You only need to enter a row 1 time and the uniqueKey can be referenced in other worksheets). The disadvantage is that it requires more work on the users part by needing to associate identifier keys between sheets.', img: 'images/singleSheet-multipleSheet.png', imgLabel: 'Single sheet format versus multiple sheet format.' },
      { type: 'container', title: '', disc: 'After you choose your project configuration (single or multiple sheet), press the "Next" button and you can choose which modules to add. Select the modules applicable to your project needs.', img: 'images/screenshotChooseModules.png', imgLabel: 'Screenshot of project creation wizard, "Choose Modules" section' },
      { type: 'container', disc: 'Please note that all projects have one owner, who may invite additional members. Each of the members in turn can create expeditions within a project. Read further to understand how expeditions work.' },
      { type: 'container', title: 'Expeditions', disc: 'Projects are composed of one or more expeditions. An expedition corresponds to a single spreadsheet, containing all related events, samples, and tissues. All data entered into GEOME must be entered as an expedition. Any member of a project may create an expedition when they first upload a spreadsheet. The expedition owner retains the right to update or alter expedition data as well as setting the expedition to public or private viewing. The project owner also has the capability to alter expedition metadata of any user within the project. Expedition identifiers can be set as unique either within the expedition itself or across the project. Finally, each expedition provides a globally unique and resolvable prefix (expedition root identifier) for each entity. When a local identifier, which is enforced as unique either within an expedition or project, is appended to the expedition root identifier, it services as a resolvable and globally unique representation for each instance of a collecting event, sample, or tissue. The provision of these identifiers happens automatically, and is noted within the system as BCIDs (biocode commons identifiers).', img: '', imgLabel: '' },
      { type: 'container', title: 'Modifying Projects: creating rules and adding attributes', disc: 'After you create your project in the project wizard, you may further customize your project using the "Project Configuration" tool. First, make sure your project you wish to modify is the currently active project by using the project navigator on the top of pane or browsing to the project using the Workbench "View Projects" tool. Second, click on "Project Configuration" under "Admin" on the left-hand panel on the workbench. Here, you can click on "Attributes" to add and remove available attributes for each entity, or "Rules" to add and remove rules for each entity. You may also customize the behavior of each entity (e.g Event, Sample, Tissue) by clicking the edit icon next to the entity. Note that at this time you may not add or remove Entities from the Project Configuration interface. This will require editing the JSON configuration file directly, which requires advanced/developer knowledge.', img: '', imgLabel: '' },
    ]
  }

  getBaseData(): Array<any> {
    return [
      { key: 'A', data:[ null, null, null, null, null, null, null, null, null, null, null, null ]},
      { key: 'B', data:[ null, null, null, null, null, null, null, null, null, null, null, null ]},
      { key: 'C', data:[ null, null, null, null, null, null, null, null, null, null, null, null ]},
      { key: 'D', data:[ null, null, null, null, null, null, null, null, null, null, null, null ]},
      { key: 'E', data:[ null, null, null, null, null, null, null, null, null, null, null, null ]},
      { key: 'F', data:[ null, null, null, null, null, null, null, null, null, null, null, null ]},
      { key: 'G', data:[ null, null, null, null, null, null, null, null, null, null, null, null ]},
      { key: 'H', data:[ null, null, null, null, null, null, null, null, null, null, null, null ]},
    ]
  }

  getSraUploadFields():Array<any>{
    return [
      { name: 'Bio Project', formName: 'bioProjectForm' },
      { name: 'Submission Info', formName: 'subInfoForm' },
      { name: 'BioSample Type', formName: 'sampleTypeForm' },
      { name: 'BioSamples', formName: 'bioSamplesForm' },
      { name: 'SRA Metadata', formName: 'metaDataForm' },
      { name: 'FIle Upload', formName: 'fileForm' },
    ];
  }

  getSraSampleTypes():Array<any>{
    return [
      { title: 'Model organism or animal sample', disc: 'Use for multicellular samples or cell lines derived from common laboratory model organisms, e.g., mouse, rat, Drosophila, worm, fish, frog, or large mammals including zoo and farm animals.', value: 'animal' },
      { title: 'Invertebrate', disc: 'Use for any invertebrate sample.', value: 'invertebrate' },
      { title: 'Plant', disc: 'Use for any plant sample or cell line.', value: 'plant' },
      { title: 'Metagenome or environmental sample', disc: 'Use for metagenomic and environmental samples when it is not appropriate or advantageous to use MIxS packages.', value: 'environmental' },
      { title: 'Virus', disc: 'Use for all virus samples not directly associated with disease. Viral pathogens should be submitted using the Pathogen: Clinical or host-associated pathogen package.', value: 'virus' },
      { title: 'Microbe', disc: 'Use for bacteria or other unicellular microbes when it is not appropriate or advantageous to use MIxS, Pathogen or Virus packages.', value: 'microbe' },
      { title: 'Human', disc: "WARNING: Only use for human samples or cell lines that have no privacy concerns. For all studies involving human subjects, it is the submitter's responsibility to ensure that the information supplied protects participant privacy in accordance with all applicable laws, regulations and institutional policies. Make sure to remove any direct personal identifiers from your submission. If there are patient privacy concerns regarding making data fully public, please submit samples and data to NCBI's dbGaP database. dbGaP has controlled access mechanisms and is an appropriate resource for hosting sensitive patient data. For samples isolated from humans use the Pathogen, Microbe or appropriate MIxS package.", value: 'human' },
      // { title: '', disc: '', value: '' },
    ];
  }

  getQueryTableCols():any{
    return {
      Event: [
        'eventID',
        'locality',
        'decimalLatitude',
        'decimalLongitude',
        'yearCollected',
        'expeditionCode',
        // 'projectCode',
        'bcid',
      ],
      Sample: [
        'materialSampleID',
        'eventID',
        'locality',
        'decimalLatitude',
        'decimalLongitude',
        'yearCollected',
        'phylum',
        'scientificName',
        'expeditionCode',
        'bcid',
      ],
      Event_Photo: [
      'img128',
        'photoID',
      'eventID',
      'qualityScore',
      'photographer',
        'expeditionCode',
        'bcid',
      ],
      Diagnostics: [
      'scientificName',
        'materialSampleID',
      'measurementType',
      'measurementValue',
      'measurementUnit',
      'diseaseTested',
      'diseaseDetected',
        'expeditionCode',
        'bcid',
      ],
      Sample_Photo: [
      'img128',
        'photoID',
        'materialSampleID',
      'qualityScore',
      'photographer',
        'expeditionCode',
        'bcid',
      ],
      Tissue: [
        'tissueID',
        'materialSampleID',
        'yearCollected',
        'scientificName',
        'tissueType',
        'tissuePlate',
        'tissueWell',
        'expeditionCode',
        'bcid',
      ],
      fastqMetadata: [
        {
          column: 'BioSample Accession #',
          get: (f:any) => (f.bioSample ? f.bioSample.accession : 'N/A'),
        },
        'tissueID',
        'materialSampleID',
        'yearCollected',
        'scientificName',
        'libraryLayout',
        'librarySource',
        'librarySelection',
        'expeditionCode',
        'bcid',
      ],
    };
  }
}
