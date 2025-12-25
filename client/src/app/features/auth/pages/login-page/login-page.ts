import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
})
export class LoginPage {
  form: FormGroup;
  authError: string | null = null;

  // constructor(private authService: Auth, private fb: FormBuilder, private router: Router) {
  //   // Initialize form in constructor after fb is available
  //   this.form = this.fb.group({
  //     email: ['', [Validators.required, Validators.email]],
  //     password: [
  //       '',
  //       [
  //         Validators.required,
  //         Validators.minLength(6),
  //         Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/),
  //       ],
  //     ],
  //   });
  // }

  //   my self

  constructor(private authService: Auth, private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(12),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/),
        ],
      ],
    });
  }

  onSubmit(): void {
    this.authError = null;

    // if invalid, show errors
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.getRawValue().email ?? '';
    const password = this.form.getRawValue().password ?? '';

    const result = this.authService.login(email, password);

    if (!result.ok) {
      this.authError = result.error;
      return;
    }

    // if succeeded, go to students page
    this.router.navigateByUrl('/students');
  }
}
