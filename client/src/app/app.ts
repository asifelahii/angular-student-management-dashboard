import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppShellLayout } from './shared/components/app-shell-layout/app-shell-layout';

@Component({
  selector: 'app-root',
  imports: [AppShellLayout],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('client');
}
