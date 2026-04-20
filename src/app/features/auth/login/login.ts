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

    const adminId = localStorage.getItem('adminId');

    if (adminId) {
      this.router.navigate(['/dashboard']); // already logged in
    }
  }

  fb = inject(FormBuilder);
  router = inject(Router);
  http = inject(HttpClient);

  errorMsg = '';

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  login() {
    console.log('LOGIN CLICKED');

    if (this.form.invalid) return;

    const { username, password } = this.form.value;

    this.http.post<any>('http://192.168.1.11:3000/admin/login', {
      username,
      password
    }).subscribe({
      next: (res) => {
        console.log('LOGIN RESPONSE:', res);

        // 🔥 IMPORTANT
        localStorage.setItem('adminId', res.admin._id);

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Invalid username or password';
      }
    });
  }
}
