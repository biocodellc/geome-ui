import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../../helpers/services/data.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgbAccordionModule, CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  // Injectables
  dataService = inject(DataService);

  // Variables
  firstSection:Array<any> = this.dataService.getAboutFirstSectionData();
  teams:Array<any> = this.dataService.getDummyTeamsData();
}
