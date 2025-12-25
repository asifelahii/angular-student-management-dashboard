import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../features/auth/services/auth';

type NavItem = {
  label: string;
  href: string;
  exact?: boolean;
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  constructor(public authService: Auth, private router: Router) {}

  // Mobile menu toggle (simple + enough for MVP)
  isMenuOpen = false;

  // Keep navigation as data (professional habit: easier to grow later)
  navItems: NavItem[] = [
    { label: 'Student List', href: '/students' }, // stays active for /students/:id too
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onLogout() {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']);
  }
}
