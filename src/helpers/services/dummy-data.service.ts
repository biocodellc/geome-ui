import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DummyDataService {

  constructor() { }

  getHomePageItems(): Array<any> {
    return [
      { img: 'images/about7.png', title: 'Getting Started', disc: 'Getting started and additional information about GEOME', route: '/about' },
      { img: 'images/search.png', title: 'Query', disc: 'Search and download sequence files and associated metadata', route: '' },
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

  getDummyTeamsData(): Array<any> {
    return [
      {
        "id": 2,
        "name": "Biocode",
        "description": "The Biocode team  began with the Moorea Biocode Project and now encompasses a set of projects that are focused on use within the Smithsonian Institution National Museum of Natural History.  The Biocode team format employs one sheet for entering collecting event related metadata (Event) and another sheet to enter both sample and tissue metadata (Samples).   Individual rows on the sample sheet contain a reference to a single tissue.  To enter multiple tissues related to a single sample, sample rows are repeated with varying tissue metadata.    This team also contains sheets for sample-photos and event-photos and lets users upload FASTQ metadata or FASTA metadata and sequences.\n\nThe Biocode configuration was developed by the Moore Foundation funded Moorea Biocode project and extended to serve a variety of related projects across marine, fresh-water, and terrestrial taxa with biosamples known to contain a mixed assemblage, therefore no specific taxonomy is expected.",
        "networkApproved": true,
        "user": {
          "userId": 259,
          "username": "meyerc",
          "email": "meyerc@si.edu"
        }
      },
      {
        "id": 45,
        "name": "AmphibiaWeb's Disease Portal",
        "description": "Motivated by the decline of amphibians globally and the growing understanding of diseases as major factors, AmphibiaWeb and the US Forest Service are collaborating to develop a community-based, online repository and reporting site for data on the pathogens which cause chytridiomycosis, Batrachochytrium dendrobatidis (Bd) and  B. salamandrivorans (Bsal). Our mission is to serve as a repository for Bd and Bsal data from field and biocollection samples and thus aggregate, visualize and share data to understand the disease dynamics of this major cause of amphibian declines worldwide.  For more information contact amphibiaweb@berkeley.edu or visit https://amphibiandisease.org    .................................................\nTo download the entire AmphibianDisease Portal, paste the following link in your browser:   https://bit.ly/3KSp1Zx",
        "networkApproved": true,
        "user": {
          "userId": 397,
          "username": "amphibianCurator",
          "email": "amphibiaweb@berkeley.edu"
        }
      },
      {
        "id": 289,
        "name": "MytiSNP",
        "description": null,
        "networkApproved": true,
        "user": {
          "userId": 731,
          "username": "robedulis",
          "email": "R.P.Ellis@exeter.ac.uk"
        }
      },
      {
        "id": 70,
        "name": "FuTRES",
        "description": "Functional Trait Resource for Environmental Studies (FuTRES) assembles data on vertebrate traits.  This project is a sample so people can visit the \"generate template\" page and view terms.  This sample project has been updated with version 3.0.0 of the FUTRES spreadsheet template at https://github.com/futres/template/releases  and version 2021-11-10 of the FuTRES Ontology",
        "networkApproved": true,
        "user": {
          "userId": 1,
          "username": "biocode",
          "email": "geome.help@gmail.com"
        }
      },
      {
        "id": 1,
        "name": "Diversity of the IndoPacific (DIPNet)",
        "description": "The Diversity of the IndoPacific (DIPNet) team uses a single sheet for entering events, samples, and tissues (Samples).    FASTQ metadata may be loaded through the interface to generate an SRA submission package.  FASTA metadata plus sequences can be loaded through the interface as well. The DIPNet team is designed for projects that are working with reduced representation (any flavor of RADseq, GTseq) and whole genome data.   The DIPNet team is open for anyone in the public to contribute by making their own project within this team. However, users will need to accept all DIPNet default values for rules and controlled vocabularies.",
        "networkApproved": true,
        "user": {
          "userId": 145,
          "username": "dipnetCurator",
          "email": "eric.d.crandall@gmail.com"
        }
      },
      {
        "id": 15,
        "name": "Ira Moana",
        "description": "The population genomics configuration uses a single sheet for entering events, samples, and tissues (Samples).   FASTQ metadata may be loaded through the interface to generate an SRA submission package.  FASTA metadata plus sequences can be loaded through the interface as well. The Population Genomics configuration originated with the Diversity of the Indopacific (DIPNet) project and is designed for projects that are working with reduced representation (any flavor of RADseq, GTseq) and whole genome data.",
        "networkApproved": true,
        "user": {
          "userId": 251,
          "username": "lliggins",
          "email": "Libby.liggins@auckland.ac.nz"
        }
      },
      {
        "id": 272,
        "name": "Global Coral Microbiome",
        "description": null,
        "networkApproved": true,
        "user": {
          "userId": 530,
          "username": "Monica_Medina",
          "email": "momedinamunoz@gmail.com"
        }
      },
      {
        "id": 154,
        "name": "Reef Restoration and Adaptation Project (RRAP)",
        "description": "This working space will store collection metadata for corals collected for genomics, and will include linkages to specimen photographs and to associated DNA sequence data (to be stored by the National Center for Biotechnology).",
        "networkApproved": true,
        "user": {
          "userId": 1,
          "username": "biocode",
          "email": "geome.help@gmail.com"
        }
      },
      {
        "id": 6,
        "name": "Smithsonian Barcoding and Global Genome Initiative",
        "description": "The Smithsonian Barcoding and Global Genome Initiative Team uses a single sheet for entering events, samples, and tissues (called Samples).   FASTQ metadata may be loaded through the interface to generate an SRA submission package.  FASTA metadata plus sequences can be loaded through the interface as well.  The individual-based sequencing configuration originated from Smithsonian Barcoding projects and the Global Genome Initiative.  This team is generally comprised of data sets utilizing Sanger-based methods (e.g. DNA barcoding) where a unique individual is the origin of each sample.",
        "networkApproved": true,
        "user": {
          "userId": 1,
          "username": "biocode",
          "email": "geome.help@gmail.com"
        }
      }
    ]
  }
}
