import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';

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
  homeItems:Array<any> = this.dataService.getHomePageItems();
  modalRef!:NgbModalRef;
  audioRef:any;

  playAudio(){
    if(!this.audioRef) this.audioRef = new Audio('audio/geome.mp3');
    this.audioRef.load();
    this.audioRef.play();
  }

  openCollabModal(content: TemplateRef<any>){
    this.modalRef = this.modalService.open(content, { animation: true, centered: true });
  }
}
