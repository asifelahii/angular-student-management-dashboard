import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from '../header/header';

@Component({
  selector: 'app-app-shell-layout',
  imports: [RouterOutlet, Header],
  templateUrl: './app-shell-layout.html',
  styleUrl: './app-shell-layout.scss',
})
export class AppShellLayout {
  hideShell = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }
      this.hideShell = !!route.snapshot.data['hideShell'];
    });
  }
}
