import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';

type HomepagePrototype = 'field' | 'ops';

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
  activePrototype: HomepagePrototype = 'field';
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
