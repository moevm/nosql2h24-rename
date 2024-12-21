import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
export class ToponymTableComponent implements OnInit {
  @Output() pageChanged = new EventEmitter<number>();

  @Input() data: ToponymDto[] = [];
  @Input() columns: string[] = [];
  @Input() pageSize = 5;

  currentPage = 0;

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
    this.toponymsService.filtersChanged$.subscribe((result) => {
      this.currentPage = 0;
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.pageChanged.emit(page);
  }
}
