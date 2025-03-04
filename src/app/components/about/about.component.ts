import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgbAccordionModule, CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  // Injectables
  dataService = inject(DummyDataService);

  // Variables
  firstSection:Array<any> = this.dataService.getAboutFirstSectionData();
  teams:Array<any> = this.dataService.getDummyTeamsData();
}
