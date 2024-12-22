import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {ToponymsService} from "../../services/toponyms.service";
import {ImportExportComponent} from "./import-export/import-export.component";
import {debounceTime, Subject, takeUntil} from "rxjs";

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
    ToponymFiltersComponent,
    ImportExportComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.sass'
})
export class MainPageComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  constructor(private readonly toponymsService: ToponymsService) {
  }

  filteredData: ToponymDto[] = [];
  pageSize = 5;
  currentPage = 1;

  columns = ['Название', 'Годы', 'Адрес', 'Фото', 'Тип', 'Стиль', 'Архитектор'];

  ngOnInit() {
    this.onFilter({});

    this.toponymsService.filtersChanged$.pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(filters => {
        this.onFilter(filters);
      });
  }

  onPageChanged(page: number) {
    this.currentPage = page;
  }

  onFilter(filterDto: FilterDto) {
    filterDto.page = this.currentPage;
    this.toponymsService.getToponyms(filterDto).subscribe((result: ToponymDto[]) => {
      this.filteredData = result;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
