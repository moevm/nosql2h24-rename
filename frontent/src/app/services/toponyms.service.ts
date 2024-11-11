import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FilterDto, ToponymDto} from "../dtos/dtos";
import {catchError, Observable, of, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ToponymsService {

  constructor(private readonly http: HttpClient) { }

  getToponyms(filters: FilterDto): Observable<ToponymDto[]> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<ToponymDto[]>('http://localhost:5001/api/toponyms', filters, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching toponyms:', error);
          return throwError(error);
        })
      );
  }
}
