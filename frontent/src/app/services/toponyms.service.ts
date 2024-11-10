import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FilterDto} from "../dtos/dtos";

@Injectable({
  providedIn: 'root'
})
export class ToponymsService {

  constructor(private readonly http: HttpClient) { }

  getToponyms(filters: FilterDto) {
    // call to this.http to backend.
    console.log(filters);
  }
}
