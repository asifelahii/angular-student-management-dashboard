import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

export type GlassSelectOption<T extends string> = {
  label: string;
  value: T;
};

@Component({
  selector: 'app-glass-select',
  standalone: true,
  templateUrl: './glass-select.html',
  styleUrls: ['./glass-select.scss'],
})
export class GlassSelect<T extends string> {
  @Input({ required: true }) label = '';
  @Input({ required: true }) options: GlassSelectOption<T>[] = [];

  // Two-way binding support: [(value)]="sortBy"
  @Input({ required: true }) value!: T;
  @Output() valueChange = new EventEmitter<T>();

  open = false;

  constructor(private host: ElementRef<HTMLElement>) {}

  get selectedLabel(): string {
    return this.options.find((o) => o.value === this.value)?.label ?? 'Select';
  }

  toggle() {
    this.open = !this.open;
  }

  close() {
    this.open = false;
  }

  select(option: GlassSelectOption<T>) {
    this.value = option.value;
    this.valueChange.emit(option.value);
    this.close();
  }

  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    if (this.open && !this.host.nativeElement.contains(target)) {
      this.close();
    }
  }

  // Basic keyboard support
  onTriggerKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggle();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  }
}
