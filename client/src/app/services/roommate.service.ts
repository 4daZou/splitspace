/**
 * SplitSpace - services/roommate.service.ts
 * Handles all HTTP communication for Roommate CRUD operations.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Roommate } from '../interfaces/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoommateService {
  private apiUrl = `${environment.apiUrl}/roommates`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Roommate[]> {
    return this.http.get<Roommate[]>(this.apiUrl);
  }

  getOne(id: string): Observable<Roommate> {
    return this.http.get<Roommate>(`${this.apiUrl}/${id}`);
  }

  create(roommate: Roommate): Observable<Roommate> {
    return this.http.post<Roommate>(this.apiUrl, roommate);
  }

  update(id: string, roommate: Partial<Roommate>): Observable<Roommate> {
    return this.http.put<Roommate>(`${this.apiUrl}/${id}`, roommate);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
