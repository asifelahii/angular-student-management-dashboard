// import { Component } from '@angular/core';
// import { RouterLink, RouterLinkActive } from '@angular/router';

// @Component({
//   selector: 'app-header',
//   imports: [RouterLink, RouterLinkActive],
//   templateUrl: './header.html',
//   styleUrl: './header.scss',
// })
// export class Header {}

import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

type NavItem = {
  label: string;
  href: string;
  exact?: boolean;
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, NgFor],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  // Mobile menu toggle (simple + enough for MVP)
  isMenuOpen = false;

  // Keep navigation as data (professional habit: easier to grow later)
  navItems: NavItem[] = [
    { label: 'Login', href: '/login', exact: true },
    { label: 'Students', href: '/students' }, // stays active for /students/:id too
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
