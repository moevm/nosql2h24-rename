import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FilterDto, ToponymDto} from "../dtos/dtos";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ToponymsService {

  constructor(private readonly http: HttpClient) { }

  getToponyms(filters: FilterDto) : Observable<ToponymDto[]> {
    // call to this.http to backend.
    console.log(filters);
    return of([
      {
        name: 'Собор Святого Исаакия',
        renameYears: [new Date('1922-01-01'), new Date('1950-05-01')],
        address: 'Исаакиевская площадь, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Собор',
        style: 'Неоклассицизм',
        architect: 'Огюст Монферран',
      },
      {
        name: 'Эрмитаж',
        renameYears: [new Date('1917-01-01')],
        address: 'Дворцовая площадь, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Музей',
        style: 'Барокко',
        architect: 'Бартоломео Растрелли',
      },
      {
        name: 'Петропавловская крепость',
        renameYears: [new Date('1703-05-16')],
        address: 'Заячий остров, Санкт-Петербург, Россия',
        photoUrl: 'https://placehold.co/600x400/EEE/31343C',
        type: 'Крепость',
        style: 'Петровское барокко',
        architect: 'Доменико Трезини',
      },
    ]);
  }
}
