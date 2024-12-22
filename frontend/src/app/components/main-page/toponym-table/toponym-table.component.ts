import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ToponymDto} from "../../../dtos/dtos";
import {NgForOf} from "@angular/common";
import {TuiPagination} from "@taiga-ui/kit";
import {
  TuiTableCell,
  TuiTableDirective,
  TuiTableTbody,
  TuiTableTd,
  TuiTableTh,
  TuiTableThGroup, TuiTableTr
} from "@taiga-ui/addon-table";
import {SafeUrlPipe} from "../../../pipes/safe-url.pipe";
import {ToponymsService} from "../../../services/toponyms.service";
import {debounceTime, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-toponym-table',
  templateUrl: './toponym-table.component.html',
  standalone: true,
  imports: [
    NgForOf,
    TuiPagination,
    TuiTableCell,
    TuiTableDirective,
    TuiTableTbody,
    TuiTableTd,
    TuiTableTh,
    TuiTableThGroup,
    TuiTableTr,
    SafeUrlPipe
  ],
})
export class ToponymTableComponent implements OnInit, OnDestroy {
  @Output() pageChanged = new EventEmitter<number>();

  @Input() data: ToponymDto[] = [];
  @Input() columns: string[] = [];
  @Input() pageSize = 5;

  currentPage = 0;

  private destroy$ = new Subject<void>();

  constructor(private readonly toponymsService: ToponymsService) {
  }

  get paginatedData(): ToponymDto[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.data.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  ngOnInit() {
    this.toponymsService.filtersChanged$.pipe(debounceTime(300),
      takeUntil(this.destroy$)).subscribe((result) => {
      this.currentPage = 0;
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.pageChanged.emit(page);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}