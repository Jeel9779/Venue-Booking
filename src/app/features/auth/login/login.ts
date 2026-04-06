import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  ngOnInit() {
    const admin = localStorage.getItem('admin');

    if (admin) {
      this.router.navigate(['/dashboard']); // already logged in
    }
  }

  fb = inject(FormBuilder);
  router = inject(Router);
  http = inject(HttpClient);

  errorMsg = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]],
    remember: [false],
  });

  login() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    this.http
      .get<any[]>(`http://localhost:3000/admins?email=${email}&password=${password}`)
      .subscribe((res) => {
        console.log(res); // 🔥 CHECK THIS

        if (res.length > 0) {
          localStorage.setItem('admin', JSON.stringify(res[0]));
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMsg = 'Invalid email or password';
        }
      });
  }
}
