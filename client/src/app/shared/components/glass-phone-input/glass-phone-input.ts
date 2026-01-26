import { Component, Input, forwardRef, HostListener } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { PhoneCountry, PHONE_COUNTRIES } from './../../data/phone-countries';

function digitsOnly(v: string) {
  return (v || '').replace(/\D/g, '');
}

@Component({
  selector: 'app-glass-phone-input',
  standalone: true,
  imports: [NgClass],
  templateUrl: './glass-phone-input.html',
  styleUrls: ['./glass-phone-input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GlassPhoneInput),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GlassPhoneInput),
      multi: true,
    },
  ],
})
export class GlassPhoneInput implements ControlValueAccessor, Validator {
  @Input() label?: string;
  @Input() submitted = false;

  countries = PHONE_COUNTRIES;

  open = false;
  selected: PhoneCountry = PHONE_COUNTRIES[0]; // default BD
  national = ''; // only digits

  disabled = false;

  // CVA
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Validator change hook
  private onValidatorChange: () => void = () => {};

  flagFor(iso2: string): string {
  // expects "BD", "US", etc.
  const cc = (iso2 || '').toUpperCase();
  if (cc.length !== 2) return '🏳️';
  const A = 0x1f1e6; // regional indicator A
  const code0 = cc.charCodeAt(0) - 65 + A;
  const code1 = cc.charCodeAt(1) - 65 + A;
  return String.fromCodePoint(code0, code1);
}

get selectedText() {
  // show: 🇧🇩 +880
  return `${this.flagFor(this.selected.iso2)} +${digitsOnly(this.selected.dialCode)}`;
}
  // ---- UI helpers ----
  // get selectedText() {
  //   return `${this.selected.name} +${this.selected.dialCode}`;
  // }

  get placeholder() {
    const example = this.selected.example || '...';
    return `e.g. ${example}`;
  }

  get showError() {
    // this flag only controls rendering; validity comes from form control
    return this.submitted;
  }

  toggle() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  close() {
    this.open = false;
  }

  selectCountry(c: PhoneCountry) {
    this.selected = c;
    this.open = false;
    this.emitValue();
    this.onValidatorChange();
  }

  onInput(ev: Event) {
    const raw = (ev.target as HTMLInputElement).value || '';
    this.national = digitsOnly(raw);

    // country-specific cleanup
    if (this.selected.iso2 === 'BD') {
      // allow users to type: 017xxxxxxxxx or 17xxxxxxxxx
      if (this.national.startsWith('0')) this.national = this.national.slice(1);
      // allow accidental "880..." typed in national
      if (this.national.startsWith('880')) this.national = this.national.slice(3);
    }

    this.emitValue();
    this.onValidatorChange();
  }

  onBlur() {
    this.onTouched();
  }

  // close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('.gp') == null) this.close();
  }

  // keyboard: Esc closes menu
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open) this.close();
  }

  // ---- CVA ----
  writeValue(value: string | null): void {
    const v = (value || '').trim();

    if (!v) {
      this.national = '';
      return;
    }

    // Parse E.164 like: +88017...
    const cleaned = v.startsWith('+') ? '+' + digitsOnly(v) : '+' + digitsOnly(v);
    const digits = cleaned.replace('+', '');

    // detect by dial code digits (without +)
    const match = PHONE_COUNTRIES.find((c) => digits.startsWith(digitsOnly(c.dialCode)));
    if (match) {
      this.selected = match;
      this.national = digits.slice(digitsOnly(match.dialCode).length);
    } else {
      // fallback: keep BD
      this.selected = PHONE_COUNTRIES[0];
      this.national = digits; // best effort
    }
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) this.open = false;
  }

  // ---- Validator ----
  validate(control: AbstractControl): ValidationErrors | null {
    const v = (control.value || '').toString().trim();
    if (!v) return null; // required handled outside

    const e164 = v.startsWith('+') ? '+' + digitsOnly(v) : '+' + digitsOnly(v);
    const digits = e164.replace('+', '');

    // basic E.164 length guard (8–15 digits)
    if (!/^\+\d{8,15}$/.test(e164)) return { invalidPhone: true };

    const dialDigits = digitsOnly(this.selected.dialCode);
    if (!digits.startsWith(dialDigits)) return { invalidPhone: true };

    const national = digits.slice(dialDigits.length);

    // Country-ish rules (simple, good enough for MVP)
    switch (this.selected.iso2) {
      case 'BD':
        // BD mobile: 11 digits starting with 1 (e.g., 17..., 18..., etc.)
        if (national.length !== 11) return { invalidPhone: true };
        if (!national.startsWith('1')) return { invalidPhone: true };
        return null;

      case 'US':
        if (national.length !== 10) return { invalidPhone: true };
        return null;

      case 'IN':
        if (national.length !== 10) return { invalidPhone: true };
        return null;

      case 'GB':
        // UK varies; keep a sane MVP range
        if (national.length < 9 || national.length > 11) return { invalidPhone: true };
        return null;

      default:
        return null;
    }
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  // ---- emit ----
  private emitValue() {
    const dialDigits = digitsOnly(this.selected.dialCode);
    const n = digitsOnly(this.national);

    if (!n) {
      this.onChange('');
      return;
    }

    // normalized E.164
    const e164 = `+${dialDigits}${n}`;
    this.onChange(e164);
  }
}
