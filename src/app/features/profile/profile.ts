import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, Mail, Shield, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  adminName = signal<string>('Loading...');
  adminEmail = signal<string>('Loading...');
  adminRole = signal<string>('Loading...');

  icons = {
    user: User,
    mail: Mail,
    shield: Shield,
    alertCircle: AlertCircle
  };

  ngOnInit() {
    const adminDataStr = localStorage.getItem('admin');
    if (adminDataStr) {
      try {
        const admin = JSON.parse(adminDataStr);
        if (admin) {
          const rawName = admin.fullName || admin.name || admin.username || 'admin';
          const displayName = rawName === 'admin' ? 'Jeel Vadukiya' : rawName.charAt(0).toUpperCase() + rawName.slice(1);
          this.adminName.set(displayName);

          const email = admin.email || (admin.username === 'admin' ? 'jeel@bookmyvenue.com' : `${admin.username}@bookmyvenue.com`);
          this.adminEmail.set(email);

          const role = admin.role || 'admin';
          this.adminRole.set(role === 'admin' ? 'PRINCIPAL ADMIN' : `${role.toUpperCase()} ADMIN`);
        }
      } catch (e) {
        console.error('Error parsing admin data', e);
      }
    }
  }
}
