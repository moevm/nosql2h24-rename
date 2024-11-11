import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {TUI_DEFAULT_MATCHER, tuiPure} from "@taiga-ui/cdk";
import {FilterDto} from "../../../dtos/dtos";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
  TuiInputModule,
  TuiInputYearModule,
  TuiMultiSelectModule,
  TuiSelectModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/legacy";
import {TuiTextfield} from "@taiga-ui/core";

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
  selector: 'app-toponym-filters',
  standalone: true,
  imports: [
    TuiInputYearModule,
    ReactiveFormsModule,
    TuiTextfield,
    TuiInputModule,
    TuiSelectModule,
    TuiMultiSelectModule,
    TuiTextfieldControllerModule
  ],
  templateUrl: './toponym-filters.component.html',
  styleUrl: './toponym-filters.component.sass'
})
export class ToponymFiltersComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<FilterDto>();

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
      type: (filters.type && filters.type?.length > 0) ? filters.type : null,
      style: (filters.style && filters.style?.length > 0) ? filters.style : null,
      hasPhoto: filters.hasPhoto,
      architect: filters.architect,
      renamedTo: filters.renamedTo,
      cardSearch: filters.cardSearch,
      constructionDateFrom: filters.constructionDateFrom,
      constructionDateTo: filters.constructionDateTo,
    };
    this.filtersChanged.emit(filterDto);
  }
}
