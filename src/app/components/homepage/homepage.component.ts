import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';

type HomepagePrototype = 'story' | 'guide';

interface CaseStudyLink {
  label: string;
  href: string;
}

interface CaseStudyPublication {
  label: string;
  href: string;
}

interface HomepageCaseStudy {
  id: string;
  source: string;
  title: string;
  summary: string;
  outcomes: string[];
  primaryLinks: CaseStudyLink[];
  publications: CaseStudyPublication[];
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
  imagePosition: string;
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, RouterLink],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit, OnDestroy {
  // Injectables
  private dataService = inject(DummyDataService);

  // Variables
  activePrototype: HomepagePrototype = 'guide';
  homeItems:Array<any> = this.dataService.getHomePageItems().map((item:any) => ({
    ...item,
    icon: this.getCardIcon(item.title),
    subtitle: this.getCardSubtitle(item.title),
    tone: this.getCardTone(item.title),
  }));
  featurePhotoOne:string = 'https://www.moorea.com/wp-content/uploads/2023/09/landscpae.jpg';
  featurePhotoTwo:string = 'https://www.moorea.com/wp-content/uploads/2023/09/crate.jpg';
  featurePhotoThree:string = 'https://www.moorea.com/wp-content/uploads/2023/09/fish.jpg';
  geomeFigureTwo:string = 'https://cdn.ncbi.nlm.nih.gov/pmc/blobs/5381/5542426/05ff4cbb49ba/pbio.2002925.g002.jpg';
  geomeResearchStories:Array<any> = [
    {
      title: 'National marine biodiversity observatory design in Aotearoa New Zealand',
      source: 'Frontiers in Marine Science (2021)',
      articleUrl: 'https://www.frontiersin.org/articles/10.3389/fmars.2021.740953/full',
      doi: 'https://doi.org/10.3389/fmars.2021.740953',
      context: 'Ira Moana reports using GEOME infrastructure for interoperable stewardship of marine genetic datasets, including links between spatio-temporal metadata and sequence resources.',
      geomeCitation: 'Cites Deck et al. 2017 (10.1371/journal.pbio.2002925)',
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aerial_view_of_a_New_Zealand_coast.jpg',
      imageAlt: 'Aerial view of New Zealand coastline',
      photoSide: 'right'
    },
    {
      title: 'Coral holobiont genome and voucher deposition guidelines',
      source: 'Frontiers in Marine Science (2021)',
      articleUrl: 'https://www.frontiersin.org/articles/10.3389/fmars.2021.701784/full',
      doi: 'https://doi.org/10.3389/fmars.2021.701784',
      context: 'Consensus guideline authors highlight GEOME as a key route for improving deposition and retrieval of molecular data plus associated metadata in biodiversity workflows.',
      geomeCitation: 'Cites Deck et al. 2017 (10.1371/journal.pbio.2002925)',
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Coral_Reef.jpg',
      imageAlt: 'Coral reef ecosystem',
      photoSide: 'left'
    },
    {
      title: 'Global amphibian chytrid surveillance portal workflows',
      source: 'Frontiers in Veterinary Science (2021)',
      articleUrl: 'https://www.frontiersin.org/articles/10.3389/fvets.2021.728232/full',
      doi: 'https://doi.org/10.3389/fvets.2021.728232',
      context: 'AmphibianDisease.org describes a GEOME-centered contributor pipeline with template download, upload processing, API access, and optional SRA linkage through GEOME.',
      geomeCitation: 'Cites Deck et al. 2017 (10.1371/journal.pbio.2002925)',
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Leopard_Frog_Closeup_(12779535195).jpg',
      imageAlt: 'Leopard frog close-up',
      photoSide: 'right'
    },
    {
      title: 'Metadata brokering and biodiversity standards alignment',
      source: 'Wellcome Open Research (2024, versioned article)',
      articleUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11292180/',
      doi: 'https://doi.org/10.12688/wellcomeopenres.18499.3',
      context: 'The COPO metadata-management discussion explicitly includes GEOME in standards alignment and FAIR data practice comparisons for large biodiversity genomics initiatives.',
      geomeCitation: 'References Deck et al. 2017 (10.1371/journal.pbio.2002925)',
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Scientist_at_computer.jpg',
      imageAlt: 'Scientist working at a computer in a laboratory',
      photoSide: 'left'
    }
  ];
  prototypeDHighlights:Array<any> = [
    {
      title: 'Validate early',
      text: 'Check locations, required fields, and standards compliance at the point of input.'
    },
    {
      title: 'Persist your own identifiers',
      text: 'Mint and retain identifiers that support attribution, tracking, and long-term reuse.'
    },
    {
      title: 'Keep workflows connected',
      text: 'Link events, samples, traits, and sequences across field, lab, and research workflows.'
    },
    {
      title: 'Publish or protect',
      text: 'Share compliant data or keep it private, with support for <a href="https://datascience.codata.org/articles/dsj-2020-043" target="_blank" rel="noopener noreferrer">CARE</a> and <a href="https://www.nature.com/articles/sdata201618" target="_blank" rel="noopener noreferrer">FAIR</a> principles throughout the workflow.'
    },
    {
      title: 'Enforce place-based rules',
      text: 'Keep collection data aligned with local laws, permit requirements, and restricted zones.'
    }
  ];
  caseStudies:HomepageCaseStudy[] = [
    {
      id: 'great-barrier-reef-corals',
      source: 'Tracking Great Barrier Reef Corals',
      title: 'Following coral colonies from reef observations to sequence-linked records',
      summary: 'The Reef Restoration and Adaptation Project uses GEOME to organise, archive, and follow thousands of coral colonies from the Great Barrier Reef. Associated data are being used to map spatial patterns of species occurrences, genetic diversity, gene flow, adaptation, and survival over time.',
      outcomes: [
        'Creates spatio-temporal records of individual coral colonies.',
        'Connects coral colony photographs to samples, supporting verification and revisions of species identities.',
        'Links NCBI hosted DNA sequence data with field and experimental metadata.',
        'Supports contributors from different institutions using a shared template and common data model.'
      ],
      primaryLinks: [
        {
          label: 'View project',
          href: 'https://gbrrestoration.org'
        }
      ],
      publications: [
        {
          label: '10.1016/j.cub.2026.04.057',
          href: 'https://doi.org/10.1016/j.cub.2026.04.057'
        },
        {
          label: '10.1126/sciadv.adt2066',
          href: 'https://doi.org/10.1126/sciadv.adt2066'
        },
        {
          label: '10.1111/eva.13644',
          href: 'https://doi.org/10.1111/eva.13644'
        },
        {
          label: '10.1038/s43247-024-01649-4',
          href: 'https://doi.org/10.1038/s43247-024-01649-4'
        },
        {
          label: '10.1098/rspb.2024.0587',
          href: 'https://doi.org/10.1098/rspb.2024.0587'
        }
      ],
      imageUrl: 'images/case-studies/cordap.jpg',
      imageAlt: 'Dr Zoe Meziere collecting coral tissue samples for DNA sequencing on the Great Barrier Reef',
      imageCaption: 'Photo: Dr Zoe Meziere collecting tissue samples for DNA sequencing.',
      imagePosition: '42% center'
    },
    {
      id: 'amphibian-disease',
      source: 'Frontiers in Veterinary Science (2021)',
      title: 'Tracking, Synthesizing, and Sharing Global Batrachochytrium Data at AmphibianDisease.org',
      summary: 'The Amphibian Disease Portal uses GEOME to archive, aggregate, and share global Bd and Bsal data, preserving legacy records while supporting sample-level datasets, reproducible metadata, and research-ready disease surveillance.',
      outcomes: [
        'Supports distributed contributors using a shared template and common data model.',
        'Improves surveillance quality by validating records before they become downstream reporting problems.',
        'Keeps field observations, pathogen testing, and public-data pathways connected in one operational workflow.',
        'Demonstrates how GEOME can scaffold a disease-monitoring program from collection through synthesis and publication.'
      ],
      primaryLinks: [
        {
          label: 'View article',
          href: 'https://www.frontiersin.org/articles/10.3389/fvets.2021.728232/full'
        },
        {
          label: 'DOI',
          href: 'https://doi.org/10.3389/fvets.2021.728232'
        }
      ],
      publications: [],
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Leopard_Frog_Closeup_(12779535195).jpg',
      imageAlt: 'Leopard frog close-up',
      imageCaption: '',
      imagePosition: 'center'
    }
  ];
  activeCaseStudyIndex:number = 0;
  caseStudyRotationMs:number = 10000;
  caseStudyUserPaused:boolean = false;
  private caseStudyHoverPaused:boolean = false;
  private caseStudyFocusPaused:boolean = false;
  private caseStudyIntervalRef:ReturnType<typeof setInterval> | undefined;
  supportOrganizations:Array<any> = [
    {
      name: 'Gordon and Betty Moore Foundation',
      href: 'https://www.moore.org/',
      logoUrl: 'images/support/moore-foundation.png',
      logoAlt: 'Gordon and Betty Moore Foundation logo',
      logoClass: 'support-logo-moore'
    },
    {
      name: 'U.S. National Science Foundation',
      href: 'https://www.nsf.gov/policies/brand',
      logoUrl: 'images/support/nsf.png',
      logoAlt: 'U.S. National Science Foundation logo',
      logoClass: 'support-logo-nsf'
    },
    {
      name: 'Smithsonian Institution National Museum of Natural History',
      href: 'https://naturalhistory.si.edu/',
      logoUrl: 'images/support/smithsonian-seal.svg',
      logoAlt: 'Smithsonian Institution seal',
      logoClass: 'support-logo-smithsonian'
    },
    {
      name: 'Berkeley Natural History Museums',
      href: 'https://bnhm.berkeley.edu/',
      logoUrl: 'images/support/bnhm.gif',
      logoAlt: 'Berkeley Natural History Museums logo',
      logoClass: 'support-logo-berkeley'
    },
    {
      name: 'Richard B. Gump South Pacific Research Station',
      href: 'https://www.moorea.berkeley.edu/',
      logoUrl: 'images/support/gump.png',
      logoAlt: 'Richard B. Gump South Pacific Research Station logo',
      logoClass: 'support-logo-gump'
    }
  ];
  audioRef:any;

  ngOnInit(): void {
    if (this.prefersReducedMotion()) {
      this.caseStudyUserPaused = true;
      return;
    }

    this.startCaseStudyRotation();
  }

  ngOnDestroy(): void {
    this.stopCaseStudyRotation();
  }

  get activeCaseStudy(): HomepageCaseStudy {
    return this.caseStudies[this.activeCaseStudyIndex];
  }

  get caseStudyIsPaused(): boolean {
    return this.caseStudyUserPaused || this.caseStudyHoverPaused || this.caseStudyFocusPaused;
  }

  getCaseStudySlidePosition(index:number): string {
    if (index === this.activeCaseStudyIndex) {
      return 'active';
    }

    return index < this.activeCaseStudyIndex ? 'before' : 'after';
  }

  private getCardIcon(title:string): string {
    if (title === 'Documentation') return 'fa-book-open';
    if (title === 'Query') return 'fa-magnifying-glass-chart';
    if (title === 'Workbench') return 'fa-screwdriver-wrench';
    return 'fa-link';
  }

  private getCardSubtitle(title:string): string {
    if (title === 'Documentation') return 'Guides, data policy, and technical references';
    if (title === 'Query') return 'Explore records across projects and expeditions';
    if (title === 'Workbench') return 'Manage projects, uploads, teams, and templates';
    return '';
  }

  private getCardTone(title:string): string {
    if (title === 'Documentation') return 'doc';
    if (title === 'Query') return 'query';
    if (title === 'Workbench') return 'bench';
    return '';
  }

  setPrototype(prototype: HomepagePrototype): void {
    this.activePrototype = prototype;
  }

  setActiveCaseStudy(index:number): void {
    if (index < 0 || index >= this.caseStudies.length) {
      return;
    }

    this.activeCaseStudyIndex = index;
    this.restartCaseStudyRotation();
  }

  nextCaseStudy(): void {
    this.setActiveCaseStudy((this.activeCaseStudyIndex + 1) % this.caseStudies.length);
  }

  previousCaseStudy(): void {
    this.setActiveCaseStudy((this.activeCaseStudyIndex - 1 + this.caseStudies.length) % this.caseStudies.length);
  }

  toggleCaseStudyRotation(): void {
    this.caseStudyUserPaused = !this.caseStudyUserPaused;
    this.restartCaseStudyRotation();
  }

  pauseCaseStudyHover(): void {
    this.caseStudyHoverPaused = true;
    this.stopCaseStudyRotation();
  }

  resumeCaseStudyHover(): void {
    this.caseStudyHoverPaused = false;
    this.startCaseStudyRotation();
  }

  pauseCaseStudyFocus(): void {
    this.caseStudyFocusPaused = true;
    this.stopCaseStudyRotation();
  }

  resumeCaseStudyFocus(event: FocusEvent): void {
    const currentTarget = event.currentTarget;

    if (
      currentTarget instanceof HTMLElement &&
      event.relatedTarget instanceof Node &&
      currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }

    this.caseStudyFocusPaused = false;
    this.startCaseStudyRotation();
  }

  playAudio(){
    if(!this.audioRef) this.audioRef = new Audio('audio/geome.mp3');
    this.audioRef.load();
    this.audioRef.play();
  }

  private startCaseStudyRotation(): void {
    if (this.caseStudyIsPaused || this.caseStudies.length < 2 || this.caseStudyIntervalRef) {
      return;
    }

    this.caseStudyIntervalRef = setInterval(() => {
      this.activeCaseStudyIndex = (this.activeCaseStudyIndex + 1) % this.caseStudies.length;
    }, this.caseStudyRotationMs);
  }

  private stopCaseStudyRotation(): void {
    if (!this.caseStudyIntervalRef) {
      return;
    }

    clearInterval(this.caseStudyIntervalRef);
    this.caseStudyIntervalRef = undefined;
  }

  private restartCaseStudyRotation(): void {
    this.stopCaseStudyRotation();
    this.startCaseStudyRotation();
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' &&
      Boolean(window.matchMedia) &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
