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
    return of([
      {
        name: 'Собор Святого Исаакия',
        renameYears: [],
        address: 'Исаакиевская площадь, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Собор',
        style: 'Неоклассицизм',
        architect: 'Огюст Монферран',
      },
      {
        name: 'Эрмитаж',
        renameYears: [],
        address: 'Дворцовая площадь, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Музей',
        style: 'Барокко',
        architect: 'Бартоломео Растрелли',
      },
      {
        name: 'Петропавловская крепость',
        renameYears: [],
        address: 'Заячий остров, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Крепость',
        style: 'Петровское барокко',
        architect: 'Доменико Трезини',
      },
      {
        name: 'Собор Святого Исаакия',
        renameYears: [],
        address: 'Исаакиевская площадь, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Собор',
        style: 'Неоклассицизм',
        architect: 'Огюст Монферран',
      },
      {
        name: 'Эрмитаж',
        renameYears: [121232,131332],
        address: 'Дворцовая площадь, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Музей',
        style: 'Барокко',
        architect: 'Бартоломео Растрелли',
      },
      {
        name: 'Петропавловская крепость',
        renameYears: [1212,131323],
        address: 'Заячий остров, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Крепость',
        style: 'Петровское барокко',
        architect: 'Доменико Трезини',
      },
      {
        name: 'Собор Святого Исаакия',
        renameYears: [1212,1313],
        address: 'Исаакиевская площадь, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Собор',
        style: 'Неоклассицизм',
        architect: 'Огюст Монферран',
      },
      {
        name: 'Эрмитаж',
        renameYears: [121232,131332],
        address: 'Дворцовая площадь, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Музей',
        style: 'Барокко',
        architect: 'Бартоломео Растрелли',
      },
      {
        name: 'Петропавловская крепость',
        renameYears: [1212,131323],
        address: 'Заячий остров, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Крепость',
        style: 'Петровское барокко',
        architect: 'Доменико Трезини',
      },
    ]);


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
