import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sra-instruction',
  standalone: true,
  imports: [],
  templateUrl: './sra-instruction.component.html',
  styles: `.doc-iframe{ width: 100%; }`
})
export class SraInstructionComponent {
  private sanitizer = inject(DomSanitizer);
  docUrl:SafeResourceUrl = '';

  constructor() {
      this.docUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.sraPageUrl);
  }
}
