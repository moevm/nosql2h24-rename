import {Component, OnInit} from '@angular/core';
import {FilterDto, ToponymDto} from "../../dtos/dtos";
import {ReactiveFormsModule} from "@angular/forms";
import {
  TuiInputModule,
  TuiInputYearModule,
  TuiMultiSelectModule,
  TuiSelectModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/legacy";
import {ToponymTableComponent} from "./toponym-table/toponym-table.component";
import {ToponymFiltersComponent} from "./toponym-filters/toponym-filters.component";

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    TuiMultiSelectModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiSelectModule,
    TuiInputModule,
    TuiInputYearModule,
    ToponymTableComponent,
    ToponymFiltersComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.sass'
})
export class MainPageComponent implements OnInit{
  data: ToponymDto[] = [
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
  ];

  filteredData: ToponymDto[] = [];
  pageSize = 10;
  currentPage = 1;

  columns = ['Название', 'Годы', 'Адрес', 'Фото', 'Тип', 'Стиль', 'Архитектор'];

  ngOnInit() {
    this.filteredData = this.data;
  }

  onPageChanged(page: number) {
    this.currentPage = page;
  }

  onFilter(filterDto: FilterDto) {
    filterDto.page = this.currentPage;

    console.log(filterDto);
  }
}
