import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';

type SegValue = 'asc' | 'desc';

@Component({
  selector: 'app-toggle',
  imports: [],
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
})
export class Toggle {
  @Input() label?: string;

  // Left = asc, Right = desc (perfect for sort direction)
  @Input() leftText = 'A–Z';
  @Input() rightText = 'Z–A';

  @Input() value: SegValue = 'asc';
  @Output() valueChange = new EventEmitter<SegValue>();

  setValue(v: SegValue) {
    if (this.value === v) return;
    this.value = v;
    this.valueChange.emit(v);
  }

  // Nice keyboard support: Left/Right arrow
  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.setValue('asc');
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.setValue('desc');
    }
  }
}
