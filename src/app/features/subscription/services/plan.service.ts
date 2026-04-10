import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan } from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private apiUrl = 'http://localhost:4000/plan';

  constructor(private http: HttpClient) {}

    getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.apiUrl);
  }

    getPlanById(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/${id}`);
  }

    addPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(this.apiUrl, plan);
  }

    updatePlan(id: number, plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/${id}`, plan);
  }

    deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

    toggleStatus(plan: Plan): Observable<Plan> {
    return this.http.patch<Plan>(`${this.apiUrl}/${plan.id}`, {
      isActive: !plan.isActive
    });
  }
}


/* Admin creates plans
Admin edits plans
Admin activates/deactivates plans
Later → Vendor will fetch plans */