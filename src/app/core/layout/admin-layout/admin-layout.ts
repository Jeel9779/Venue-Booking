import { Component } from '@angular/core';
import { Sidebar } from '@core/layout/sidebar/sidebar';
import { Header } from '@core/layout/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {

}