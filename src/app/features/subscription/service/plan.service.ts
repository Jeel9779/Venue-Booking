import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Plan } from '../models/plan.model'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:4000/plans';

  // ✅ GET all plans
  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.apiUrl);
  }

  // ✅ GET single plan
  getPlanById(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/${id}`);
  }

  // ✅ CREATE plan
  addPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(this.apiUrl, plan);
  }

  // ✅ UPDATE plan
   updatePlan(id: number, plan: any): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/${id}`, plan);
  } 
/*  updatePlan(id: number, plan: any) {
  return this.http.put(`http://localhost:4000/plans/${id}`, plan);
} */

  // ✅ DELETE plan
  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
