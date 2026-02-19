import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';

type HomepagePrototype = 'field' | 'ops' | 'story';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, RouterLink],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  // Injectables
  private modalService = inject(NgbModal);
  private dataService = inject(DummyDataService);

  // Variables
  activePrototype: HomepagePrototype = 'story';
  homeItems:Array<any> = this.dataService.getHomePageItems().map((item:any) => ({
    ...item,
    icon: this.getCardIcon(item.title),
    subtitle: this.getCardSubtitle(item.title),
    tone: this.getCardTone(item.title),
  }));
  quoteCardsField:Array<any> = [
    {
      quote: 'From tide pool to sequencer, context is the science.',
      byline: 'Metadata-first field operations'
    },
    {
      quote: 'A sample without provenance is just an object.',
      byline: 'Project-level traceability'
    },
    {
      quote: 'Confidence grows when collection and analysis stay linked.',
      byline: 'Field-lab continuity'
    }
  ];
  quoteCardsOps:Array<any> = [
    {
      quote: 'Fast teams trust structured data.',
      byline: 'Operational mode'
    },
    {
      quote: 'Validation is not a hurdle. It is quality assurance.',
      byline: 'Load-time feedback'
    },
    {
      quote: 'Query once. Reuse forever.',
      byline: 'Reusable expedition records'
    }
  ];
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
  modalRef!:NgbModalRef;
  audioRef:any;

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

  get activeQuotes(): Array<any> {
    return this.activePrototype === 'field' ? this.quoteCardsField : this.quoteCardsOps;
  }

  setPrototype(prototype: HomepagePrototype): void {
    this.activePrototype = prototype;
  }

  playAudio(){
    if(!this.audioRef) this.audioRef = new Audio('audio/geome.mp3');
    this.audioRef.load();
    this.audioRef.play();
  }

  openCollabModal(content: TemplateRef<any>){
    this.modalRef = this.modalService.open(content, { animation: true, centered: true });
  }
}
