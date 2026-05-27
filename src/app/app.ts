// Purpose: Component/Logic: Handles UI behavior and user interactions for app.
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '@shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
// Defines the structure and behavior of this class
export class App {
  protected readonly title = signal('admin');
}
