import { Component } from '@angular/core';
import {FilterDto, ToponymDto} from "../../dtos/dtos";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {TUI_DEFAULT_MATCHER, tuiPure} from "@taiga-ui/cdk";
import {
  TuiInputModule,
  TuiInputYearModule,
  TuiMultiSelectModule,
  TuiSelectModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/legacy";
import {ToponymTableComponent} from "./toponym-table/toponym-table.component";

// TODO: ВЫНЕСТИ В ОТДЕЛЬНЫЙ ФАЙЛ ИЛИ ТЯНУТЬ С БЕКА ТИПЫ
const TYPES: readonly string[] = [
  'Мосты',
  'Здание или комплекс зданий',
  'Парки, скверы и сады',
  'Другие',
];

const STYLES: readonly string[] = [
  'Неоклассицизм',
  'Барокко',
  'Петровское барокко',
  'Конструктивизм',
  'Модерн',
];

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
    ToponymTableComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.sass'
})
export class MainPageComponent {
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

  pageSize = 10;

  filtersForm = new FormGroup({
    type: new FormControl<string[] | null>(null),
    style: new FormControl<string[] | null>(null),
    hasPhoto: new FormControl<boolean | null>(null),
    architect: new FormControl<string | null>(null),
    renamedTo: new FormControl<string | null>(null),
    cardSearch: new FormControl<string | null>(null),
    constructionDateFrom: new FormControl<number | null>(null),
    constructionDateTo: new FormControl<number | null>(null),
  });

  searchType: string | null = '';
  searchStyle: string | null = '';

  ngOnInit() {
    this.filtersForm.valueChanges.subscribe(() => {
      this.onFilter();
    });
  }

  @tuiPure
  filterTypes(search: string | null): readonly string[] {
    return TYPES.filter((item) => TUI_DEFAULT_MATCHER(item, search || ''));
  }

  @tuiPure
  filterStyles(search: string | null): readonly string[] {
    return STYLES.filter((item) => TUI_DEFAULT_MATCHER(item, search || ''));
  }

  onFilter() {
    const filters = this.filtersForm.value;
    const filterDto: FilterDto = {
      type: filters.type,
      style: filters.style,
      hasPhoto: filters.hasPhoto,
      architect: filters.architect,
      renamedTo: filters.renamedTo,
      cardSearch: filters.cardSearch,
      constructionDateFrom: filters.constructionDateFrom,
      constructionDateTo: filters.constructionDateTo,
    };
    console.log('Filters:', filterDto);
  }

  columns = ['Название', 'Годы', 'Адрес', 'Фото', 'Тип', 'Стиль', 'Архитектор'];
}
