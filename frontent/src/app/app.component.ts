import {TuiButton, TuiRoot} from "@taiga-ui/core";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ToponymDto} from "../dtos/dtos";
import {TuiPagination} from "@taiga-ui/kit";
import {TuiTable} from "@taiga-ui/addon-table";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TuiRoot, TuiButton, TuiPagination, TuiTable, NgForOf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'frontent';

  data: ToponymDto[] = [
    {
      name: 'St. Isaac\'s Cathedral',
      renameYears: [new Date('1922-01-01'), new Date('1950-05-01')],
      address: 'St. Isaac\'s Square, Saint Petersburg, Russia',
      photoUrl: 'https://example.com/photo1.jpg',
      type: 'Cathedral',
      style: 'Neoclassical',
      architect: 'Auguste de Montferrand'
    },
    {
      name: 'Hermitage Museum',
      renameYears: [new Date('1917-01-01')],
      address: 'Palace Square, Saint Petersburg, Russia',
      photoUrl: 'https://example.com/photo2.jpg',
      type: 'Museum',
      style: 'Baroque',
      architect: 'Bartolomeo Rastrelli'
    },
    {
      name: 'Peter and Paul Fortress',
      renameYears: [new Date('1703-05-16')],
      address: 'Zayachy Island, Saint Petersburg, Russia',
      photoUrl: 'https://example.com/photo3.jpg',
      type: 'Fortress',
      style: 'Petrine Baroque',
      architect: 'Domenico Trezzini'
    }
  ];

  currentPage = 0;
  pageSize = 10;

  get paginatedData(): ToponymDto[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.data.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  getRenameYears(renameYears: Date[]) {
    return renameYears.join(':')
  }

  columns = ['name', 'renameYears', 'address', 'photoUrl', 'type', 'style', 'architect'];
}
