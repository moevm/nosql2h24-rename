import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { FilterDto, ToponymDto } from "../dtos/dtos";
import { catchError, Observable, throwError } from "rxjs";

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

  import(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = `http://localhost:5001/api/import`;

    return this.http.post(uploadUrl, formData)
      .pipe(
        catchError(error => {
          console.error('Error importing JSON:', error);
          return throwError(() => error);
        })
      );
  }

  export(): Observable<Blob> {
    const downloadUrl = `http://localhost:5001/api/export`;
    const headers = new HttpHeaders({ 'Accept': 'application/json' });

    return this.http.get(downloadUrl, { headers, responseType: 'blob' }).pipe(
      catchError(error => {
        console.error('Error exporting JSON:', error);
        return throwError(() => error);
      })
    );
  }
}
