import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FAQ_SECTIONS } from './faq-content';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  readonly sections = FAQ_SECTIONS;
  private readonly expandedItems = new Set<string>();
  copiedItemId = '';

  ngOnInit(): void {
    this.route.fragment.subscribe((fragment) => {
      if (!fragment) return;
      this.focusItem(fragment);
    });
  }

  scrollToSection(sectionId: string): void {
    const target = this.document.getElementById(sectionId);
    target?.scrollIntoView({ block: 'start' });
  }

  toggleItem(itemId: string): void {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
      return;
    }

    this.expandedItems.add(itemId);
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }

  focusItem(itemId: string): void {
    this.expandedItems.add(itemId);
    setTimeout(() => {
      const target = this.document.getElementById(itemId);
      target?.scrollIntoView({ block: 'start' });
    });
  }

  openItemLink(itemId: string): void {
    this.document.defaultView?.history.replaceState(null, '', `${this.document.location.pathname}#${itemId}`);
    this.focusItem(itemId);
  }

  async copyItemLink(itemId: string): Promise<void> {
    const url = `${this.document.location.origin}${this.document.location.pathname}#${itemId}`;

    try {
      const clipboard = this.document.defaultView?.navigator?.clipboard;
      if (!clipboard) throw new Error('Clipboard API unavailable');
      await clipboard.writeText(url);
      this.copiedItemId = itemId;
      this.clearCopiedState();
    } catch {
      const textArea = this.document.createElement('textarea');
      textArea.value = url;
      this.document.body.appendChild(textArea);
      textArea.select();
      this.document.execCommand('copy');
      this.document.body.removeChild(textArea);
      this.copiedItemId = itemId;
      this.clearCopiedState();
    }
  }

  private clearCopiedState(): void {
    setTimeout(() => {
      this.copiedItemId = '';
    }, 2000);
  }
}
