import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';

@Component({
  selector: 'app-app-shell-layout',
  imports: [RouterOutlet, Header],
  templateUrl: './app-shell-layout.html',
  styleUrl: './app-shell-layout.scss',
})
export class AppShellLayout {}
