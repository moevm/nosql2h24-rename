import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { FilterDto, ToponymDto } from "../dtos/dtos";
import { catchError, Observable, Subject, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ToponymsService {
  filtersChanged$ = new Subject<FilterDto>();

  private readonly API_BASE_URL = 'http://127.0.0.1:5001/api';

  constructor(private readonly http: HttpClient) { }

  getToponyms(filters: FilterDto): Observable<ToponymDto[]> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<ToponymDto[]>(`${this.API_BASE_URL}/toponyms`, filters, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching toponyms:', error);
          return throwError(error);
        })
      );
  }

  import(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = `${this.API_BASE_URL}/import`;

    return this.http.post(uploadUrl, formData)
      .pipe(
        catchError(error => {
          console.error('Error importing JSON:', error);
          return throwError(() => error);
        })
      );
  }

  export(): Observable<Blob> {
    const downloadUrl = `${this.API_BASE_URL}/export`;
    const headers = new HttpHeaders({ 'Accept': 'application/json' });

    return this.http.get(downloadUrl, { headers, responseType: 'blob' }).pipe(
      catchError(error => {
        console.error('Error exporting JSON:', error);
        return throwError(() => error);
      })
    );
  }
}
