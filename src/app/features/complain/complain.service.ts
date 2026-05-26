import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Complaint {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComplainService {
  constructor() {}

  /**
   * Placeholder submission method. Replace with real HTTP call when the backend is ready.
   */
  submitComplaint(complaint: Complaint): Observable<any> {
    console.log('Submitting complaint (placeholder)', complaint);
    // Simulate a successful async response
    return of({ success: true });
  }
}
