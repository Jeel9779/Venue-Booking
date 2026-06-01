import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Moon, Sun, Monitor, Palette } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  icons = {
    moon: Moon,
    sun: Sun,
    monitor: Monitor,
    palette: Palette
  };

  currentTheme = signal<string>('light');

  constructor() {
    // Effect to apply the theme whenever it changes
    effect(() => {
      const theme = this.currentTheme();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    });
  }

  ngOnInit() {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    }
  }

  setTheme(theme: string) {
    this.currentTheme.set(theme);
  }
}
